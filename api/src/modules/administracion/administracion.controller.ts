import { Body, Controller, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../../guards/admin.guard';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { AdministracionService } from './administracion.service';
import { AuditFilterDto, CreateOperadorDto, UpdateOperadorDto } from './dto/administracion.dto';
import { AuthenticatedUser } from '../../types/authenticated-user';

@Controller('administracion')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdministracionController {
  constructor(private service: AdministracionService) {}
  @Get('operadores') operadores() { return this.service.findOperadores(); }
  @Post('operadores') create(@Body() dto: CreateOperadorDto, @Request() req: { user: AuthenticatedUser }) { return this.service.createOperador(dto, req.user); }
  @Patch('operadores/:id') update(@Param('id') id: string, @Body() dto: UpdateOperadorDto, @Request() req: { user: AuthenticatedUser }) { return this.service.updateOperador(id, dto, req.user); }
  @Post('operadores/:id/reset-password') resetPassword(@Param('id') id: string, @Request() req: { user: AuthenticatedUser }) { return this.service.resetOperadorPassword(id, req.user); }
  @Get('auditoria') audit(@Query() filters: AuditFilterDto) { return this.service.audit(filters); }
}
