import {
  Controller,
  Get,
  Post,
  Patch,
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
import { AdminGuard } from '../../guards/admin.guard';
import { AuthenticatedUser } from '../../types/authenticated-user';

type AuthenticatedRequest = {
  user: AuthenticatedUser;
};

@Controller('estudiantes')
@UseGuards(JwtAuthGuard)
export class EstudiantesController {
  constructor(private estudiantesService: EstudiantesService) {}

  @Post()
  async create(@Body() createEstudianteDto: CreateEstudianteDto, @Request() req: AuthenticatedRequest) {
    return this.estudiantesService.create(createEstudianteDto, req.user);
  }

  @Get()
  async findAll(@Query() filters: FilterEstudiantesDto, @Request() req: AuthenticatedRequest) {
    return this.estudiantesService.findAll(filters, req.user);
  }

  @Get(':id')
  async findById(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.estudiantesService.findById(id, req.user);
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  async update(
    @Param('id') id: string,
    @Body() updateEstudianteDto: UpdateEstudianteDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.estudiantesService.update(id, updateEstudianteDto, req.user);
  }

  @Patch(':id/desactivar')
  @UseGuards(AdminGuard)
  async desactivar(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.estudiantesService.desactivar(id, req.user);
  }

  @Patch(':id/suspender')
  @UseGuards(AdminGuard)
  async suspender(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.estudiantesService.suspender(id, req.user);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  async delete(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.estudiantesService.delete(id, req.user);
  }
}
