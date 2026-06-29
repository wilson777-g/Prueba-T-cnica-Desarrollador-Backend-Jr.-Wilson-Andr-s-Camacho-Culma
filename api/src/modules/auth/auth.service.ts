import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { AuthResponseDto, LoginDto, RegisterDto } from './dto/auth.dto';

const DUMMY_PASSWORD_HASH = bcrypt.hashSync('invalid-password', 10);

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const email = registerDto.email.toLowerCase().trim();
    const nombre = registerDto.nombre.trim();
    const rol = registerDto.rol as UserRole;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('Email ya registrado');
    }

    if (rol === UserRole.OPERADOR && !registerDto.sedeId) {
      throw new BadRequestException('Un operador debe estar asociado a una sede');
    }

    if (registerDto.sedeId) {
      const sede = await this.prisma.sede.findUnique({
        where: { id: registerDto.sedeId },
      });

      if (!sede) {
        throw new BadRequestException('Sede no encontrada');
      }
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        nombre,
        password: hashedPassword,
        rol,
        sedeId: rol === UserRole.OPERADOR ? registerDto.sedeId : null,
      },
      select: {
        id: true,
        email: true,
        nombre: true,
        rol: true,
        sedeId: true,
        activo: true,
        createdAt: true,
      },
    });

    return { user };
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const email = loginDto.email.toLowerCase().trim();

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    const passwordMatch = await bcrypt.compare(
      loginDto.password,
      user?.password || DUMMY_PASSWORD_HASH,
    );

    const isBlocked = Boolean(user?.bloqueadoHasta && user.bloqueadoHasta > new Date());

    if (!user || !passwordMatch || !user.activo || isBlocked) {
      if (user && !passwordMatch && !isBlocked) {
        const intentosFallo = user.intentosFallo + 1;
        await this.prisma.user.update({
          where: { id: user.id },
          data: {
            intentosFallo,
            bloqueadoHasta:
              intentosFallo >= 5 ? new Date(Date.now() + 30 * 60 * 1000) : user.bloqueadoHasta,
          },
        });
      }

      throw new UnauthorizedException('Credenciales invalidas');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        intentosFallo: 0,
        bloqueadoHasta: null,
        ultimoLogin: new Date(),
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
        expiresIn: this.configService.getOrThrow<string>('JWT_EXPIRATION') as JwtSignOptions['expiresIn'],
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

  validateToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('Token invalido o expirado');
    }
  }
}
