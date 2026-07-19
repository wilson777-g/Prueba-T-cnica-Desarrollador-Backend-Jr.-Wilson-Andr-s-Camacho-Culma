import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../../guards/admin.guard';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { AdministracionService } from './administracion.service';
import { AuditFilterDto, CreateOperadorDto, UpdateOperadorDto } from './dto/administracion.dto';

@Controller('administracion')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdministracionController {
  constructor(private service: AdministracionService) {}
  @Get('operadores') operadores() { return this.service.findOperadores(); }
  @Post('operadores') create(@Body() dto: CreateOperadorDto) { return this.service.createOperador(dto); }
  @Patch('operadores/:id') update(@Param('id') id: string, @Body() dto: UpdateOperadorDto) { return this.service.updateOperador(id, dto); }
  @Get('auditoria') audit(@Query() filters: AuditFilterDto) { return this.service.audit(filters); }
}
