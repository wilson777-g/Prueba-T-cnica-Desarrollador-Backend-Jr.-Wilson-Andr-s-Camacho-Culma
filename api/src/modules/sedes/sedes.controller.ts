import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { SedesService } from './sedes.service';
import { CreateSedeDto, UpdateSedeDto } from './dto/sede.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { AdminGuard } from '../../guards/admin.guard';

@Controller('api/sedes')
@UseGuards(JwtAuthGuard)
export class SedesController {
  constructor(private sedesService: SedesService) {}

  @Post()
  @UseGuards(AdminGuard)
  async create(@Body() createSedeDto: CreateSedeDto) {
    return this.sedesService.create(createSedeDto);
  }

  @Get()
  async findAll() {
    return this.sedesService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.sedesService.findById(id);
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  async update(@Param('id') id: string, @Body() updateSedeDto: UpdateSedeDto) {
    return this.sedesService.update(id, updateSedeDto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  async delete(@Param('id') id: string) {
    return this.sedesService.delete(id);
  }
}
