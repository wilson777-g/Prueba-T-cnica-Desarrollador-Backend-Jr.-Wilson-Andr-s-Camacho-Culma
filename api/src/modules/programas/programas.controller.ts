import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../../guards/admin.guard';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CreateProgramaDto, UpdateProgramaDto } from './dto/programa.dto';
import { ProgramasService } from './programas.service';

@Controller('programas')
@UseGuards(JwtAuthGuard)
export class ProgramasController {
  constructor(private service: ProgramasService) {}
  @Get() findAll() { return this.service.findAll(); }
  @Post() @UseGuards(AdminGuard) create(@Body() dto: CreateProgramaDto) { return this.service.create(dto); }
  @Put(':id') @UseGuards(AdminGuard) update(@Param('id') id: string, @Body() dto: UpdateProgramaDto) {
    return this.service.update(id, dto);
  }
}
