import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
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
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('verify')
  @UseGuards(JwtAuthGuard)
  async verify(@Request() req: { user: AuthenticatedUser }) {
    return {
      message: 'Token valido',
      user: req.user,
    };
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  changePassword(@Body() dto: ChangePasswordDto, @Request() req: { user: AuthenticatedUser }) {
    return this.authService.changePassword(req.user.id, dto);
  }
}
