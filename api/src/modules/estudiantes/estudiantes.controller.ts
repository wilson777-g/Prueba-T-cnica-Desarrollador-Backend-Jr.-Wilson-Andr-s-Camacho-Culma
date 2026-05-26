import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { EstudiantesService } from './estudiantes.service';
import { CreateEstudianteDto, UpdateEstudianteDto, FilterEstudiantesDto } from './dto/estudiante.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@Controller('api/estudiantes')
@UseGuards(JwtAuthGuard)
export class EstudiantesController {
  constructor(private estudiantesService: EstudiantesService) {}

  @Post()
  async create(@Body() createEstudianteDto: CreateEstudianteDto, @Request() req) {
    return this.estudiantesService.create(createEstudianteDto, req.user);
  }

  @Get()
  async findAll(@Query() filters: FilterEstudiantesDto, @Request() req) {
    return this.estudiantesService.findAll(filters, req.user);
  }

  @Get(':id')
  async findById(@Param('id') id: string, @Request() req) {
    return this.estudiantesService.findById(id, req.user);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateEstudianteDto: UpdateEstudianteDto,
    @Request() req,
  ) {
    return this.estudiantesService.update(id, updateEstudianteDto, req.user);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req) {
    return this.estudiantesService.delete(id, req.user);
  }
}
