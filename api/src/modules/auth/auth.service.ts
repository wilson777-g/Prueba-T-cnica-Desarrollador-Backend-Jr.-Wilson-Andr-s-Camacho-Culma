import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto, LoginDto, AuthResponseDto } from './dto/auth.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * Registro de nuevo usuario
   * Validaciones de seguridad:
   * - Email único
   * - Contraseña hasheada con bcrypt
   * - Solo ADMIN puede crear ADMIN
   */
  async register(registerDto: RegisterDto, requestingUser?: any): Promise<AuthResponseDto> {
    const { email, password, nombre, sedeId } = registerDto;

    // Validar email único
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('Email ya registrado');
    }

    // Hash de contraseña con salt 10
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const user = await this.prisma.user.create({
        data: {
          email,
          nombre,
          password: hashedPassword,
          sedeId,
          rol: UserRole.OPERADOR, // Los nuevos siempre son OPERADOR
        },
        select: {
          id: true,
          email: true,
          nombre: true,
          rol: true,
          sedeId: true,
        },
      });

      const access_token = this.jwtService.sign(
        {
          email: user.email,
          rol: user.rol,
          sedeId: user.sedeId,
        },
        {
          subject: user.id,
          expiresIn: process.env.JWT_EXPIRATION || '1h',
        },
      );

      return {
        access_token,
        user,
      };
    } catch (error) {
      throw new BadRequestException('Error al registrar usuario');
    }
  }

  /**
   * Login con protección contra timing attacks
   * - Usar bcryptjs para comparación segura (siempre tarda igual)
   * - Rate limiting aplicado a nivel de middleware
   * - Bloqueo temporal por intentos fallidos
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Buscar usuario (sin revelar si existe o no)
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    // Comparación segura con timing constante
    const passwordMatch = user
      ? await bcrypt.compare(password, user.password)
      : await bcrypt.compare(password, '$2b$10$dummy'); // Dummy hash para mantener tiempo

    if (!user || !passwordMatch || !user.activo) {
      // Intentos fallidos
      if (user && !passwordMatch) {
        const intentos = user.intentosFallo + 1;
        let bloqueadoHasta = user.bloqueadoHasta;

        // Bloquear después de 5 intentos por 30 minutos
        if (intentos >= 5) {
          bloqueadoHasta = new Date(Date.now() + 30 * 60 * 1000);
        }

        await this.prisma.user.update({
          where: { id: user.id },
          data: {
            intentosFallo: intentos,
            bloqueadoHasta,
          },
        });
      }

      // Respuesta genérica
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar bloqueo
    if (user.bloqueadoHasta && user.bloqueadoHasta > new Date()) {
      throw new UnauthorizedException('Cuenta bloqueada temporalmente');
    }

    // Reset de intentos fallidos
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        intentosFallo: 0,
        bloqueadoHasta: null,
        ultimoLogin: new Date(),
      },
    });

    // Generar JWT
    const access_token = this.jwtService.sign(
      {
        email: user.email,
        rol: user.rol,
        sedeId: user.sedeId,
      },
      {
        subject: user.id,
        expiresIn: process.env.JWT_EXPIRATION || '1h',
      },
    );

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        rol: user.rol,
        sedeId: user.sedeId,
      },
    };
  }

  /**
   * Validar token JWT
   */
  validateToken(token: string): any {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
