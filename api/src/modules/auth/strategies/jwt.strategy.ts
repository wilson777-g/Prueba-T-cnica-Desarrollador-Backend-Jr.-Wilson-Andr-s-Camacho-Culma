import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';

type JwtPayload = {
  sub: string;
  email?: string;
  ver?: number;
  csrf?: string;
};

const cookieToken = (request: { headers?: { cookie?: string } }) => {
  const cookies = request?.headers?.cookie || '';
  const value = cookies.split(';').map(item => item.trim()).find(item => item.startsWith('dna_session='));
  return value ? decodeURIComponent(value.slice('dna_session='.length)) : null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private prisma: PrismaService,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([ExtractJwt.fromAuthHeaderAsBearerToken(), cookieToken]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        nombre: true,
        rol: true,
        sedeId: true,
        activo: true,
        deletedAt: true,
        tokenVersion: true,
      },
    });

    if (!user || !user.activo || user.deletedAt || payload.ver !== user.tokenVersion) {
      throw new UnauthorizedException('Token invalido o usuario inactivo');
    }

    return {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      rol: user.rol,
      sedeId: user.sedeId,
      csrf: payload.csrf,
    };
  }
}
