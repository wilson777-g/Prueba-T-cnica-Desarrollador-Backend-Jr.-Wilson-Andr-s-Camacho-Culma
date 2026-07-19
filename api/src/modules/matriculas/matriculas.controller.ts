import { Body, Controller, Get, Param, Patch, Post, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { AuthenticatedUser } from '../../types/authenticated-user';
import { CreateMatriculaDto, FilterMatriculasDto, UpdateMatriculaEstadoDto } from './dto/matricula.dto';
import { MatriculasService } from './matriculas.service';

@Controller('matriculas')
@UseGuards(JwtAuthGuard)
export class MatriculasController {
  constructor(private service: MatriculasService) {}
  @Get() findAll(@Query() filters: FilterMatriculasDto, @Request() req: { user: AuthenticatedUser }) { return this.service.findAll(filters, req.user); }
  @Post() create(@Body() dto: CreateMatriculaDto, @Request() req: { user: AuthenticatedUser }) { return this.service.create(dto, req.user); }
  @Patch(':id/estado') changeStatus(@Param('id') id: string, @Body() dto: UpdateMatriculaEstadoDto, @Request() req: { user: AuthenticatedUser }) { return this.service.changeStatus(id, dto, req.user); }
}
