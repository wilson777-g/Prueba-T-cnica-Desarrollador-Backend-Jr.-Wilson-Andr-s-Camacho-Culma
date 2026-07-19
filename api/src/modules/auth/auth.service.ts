import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { AuthResponseDto, ChangePasswordDto, ForgotPasswordDto, LoginDto, RegisterDto, ResetPasswordDto } from './dto/auth.dto';

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

    const csrf_token = randomBytes(32).toString('base64url');
    const access_token = this.jwtService.sign(
      {
        email: user.email,
        rol: user.rol,
        sedeId: user.sedeId,
        ver: user.tokenVersion,
        csrf: csrf_token,
        pwd: user.mustChangePassword,
      },
      {
        subject: user.id,
        expiresIn: this.configService.getOrThrow<string>('JWT_EXPIRATION') as JwtSignOptions['expiresIn'],
      },
    );

    return {
      access_token,
      csrf_token,
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        rol: user.rol,
        sedeId: user.sedeId,
        mustChangePassword: user.mustChangePassword,
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

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !(await bcrypt.compare(dto.currentPassword, user.password))) {
      throw new UnauthorizedException('La contraseña actual no es válida');
    }
    if (await bcrypt.compare(dto.newPassword, user.password)) {
      throw new BadRequestException('La nueva contraseña debe ser diferente de la actual');
    }
    await this.prisma.$transaction(async tx => {
      await tx.user.update({ where: { id: userId }, data: { password: await bcrypt.hash(dto.newPassword, 12), tokenVersion: { increment: 1 }, mustChangePassword: false } });
      await tx.auditLog.create({ data: { userId, accion: 'CONTRASENA_CAMBIADA', entidad: 'User', entidadId: userId, detalle: { sesionesRevocadas: true } } });
    });
    return { message: 'Contraseña actualizada. Inicia sesión nuevamente.' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const genericResponse = { message: 'Si el correo corresponde a una cuenta activa, recibirás instrucciones para restablecer la contraseña.' };
    const email = dto.email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.activo || user.deletedAt) return genericResponse;

    const token = randomBytes(32).toString('base64url');
    const resetTokenHash = createHash('sha256').update(token).digest('hex');
    const resetTokenExpiresAt = new Date(Date.now() + 30 * 60 * 1000);
    await this.prisma.user.update({ where: { id: user.id }, data: { resetTokenHash, resetTokenExpiresAt } });

    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (!apiKey) {
      console.error('RESEND_API_KEY no está configurada');
      return genericResponse;
    }

    const appUrl = this.configService.get<string>('APP_URL') || 'https://dna-music-web.vercel.app';
    const from = this.configService.get<string>('EMAIL_FROM') || 'DNA Music <onboarding@resend.dev>';
    // Resend solo permite enviar al propietario de la cuenta mientras no haya dominio verificado.
    const recipient = this.configService.get<string>('EMAIL_TEST_TO') || user.email;
    const resetUrl = `${appUrl.replace(/\/$/, '')}/restablecer-contrasena?token=${encodeURIComponent(token)}`;
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from,
          to: [recipient],
          subject: 'Restablece tu contraseña de DNA Music',
          html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#20272d"><h1 style="font-size:24px">Restablecimiento de contraseña</h1><p>Hola ${this.escapeHtml(user.nombre)},</p><p>Recibimos una solicitud para cambiar la contraseña de tu cuenta institucional.</p><p><a href="${resetUrl}" style="display:inline-block;background:#246b68;color:#fff;padding:12px 18px;text-decoration:none">Establecer nueva contraseña</a></p><p>Este enlace vence en 30 minutos y solo puede utilizarse una vez. Si no realizaste la solicitud, ignora este mensaje.</p></div>`,
        }),
      });
      if (!response.ok) console.error(`Resend rechazó el correo de recuperación: ${response.status}`);
    } catch (error) {
      console.error('No fue posible contactar al proveedor de correo', error instanceof Error ? error.message : 'error');
    }
    return genericResponse;
  }

  async resetPassword(dto: ResetPasswordDto) {
    const resetTokenHash = createHash('sha256').update(dto.token).digest('hex');
    const user = await this.prisma.user.findFirst({
      where: { resetTokenHash, resetTokenExpiresAt: { gt: new Date() }, activo: true, deletedAt: null },
    });
    if (!user) throw new BadRequestException('El enlace no es válido o ya expiró');
    if (await bcrypt.compare(dto.newPassword, user.password)) {
      throw new BadRequestException('La nueva contraseña debe ser diferente de la anterior');
    }
    await this.prisma.$transaction(async tx => {
      await tx.user.update({ where: { id: user.id }, data: { password: await bcrypt.hash(dto.newPassword, 12), resetTokenHash: null, resetTokenExpiresAt: null, tokenVersion: { increment: 1 }, mustChangePassword: false, intentosFallo: 0, bloqueadoHasta: null } });
      await tx.auditLog.create({ data: { userId: user.id, accion: 'CONTRASENA_RESTABLECIDA', entidad: 'User', entidadId: user.id, detalle: { sesionesRevocadas: true, canal: 'correo' } } });
    });
    return { message: 'Contraseña actualizada. Ya puedes iniciar sesión.' };
  }

  private escapeHtml(value: string) {
    return value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[character] || character);
  }
}
