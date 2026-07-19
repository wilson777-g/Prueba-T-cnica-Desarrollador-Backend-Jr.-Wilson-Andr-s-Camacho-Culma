import { Controller, Get, Post, Body, UseGuards, Request, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, ChangePasswordDto } from './dto/auth.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { AdminGuard } from '../../guards/admin.guard';
import { AuthenticatedUser } from '../../types/authenticated-user';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.authService.login(loginDto);
    response.cookie('dna_session', result.access_token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 60 * 60 * 1000 });
    return result;
  }

  @Get('verify')
  @UseGuards(JwtAuthGuard)
  async verify(@Request() req: { user: AuthenticatedUser }) {
    return {
      message: 'Token valido',
      user: { id: req.user.id, email: req.user.email, nombre: req.user.nombre, rol: req.user.rol, sedeId: req.user.sedeId },
      csrf_token: req.user.csrf,
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('dna_session', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/' });
    return { message: 'Sesión cerrada' };
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  changePassword(@Body() dto: ChangePasswordDto, @Request() req: { user: AuthenticatedUser }) {
    return this.authService.changePassword(req.user.id, dto);
  }
}
