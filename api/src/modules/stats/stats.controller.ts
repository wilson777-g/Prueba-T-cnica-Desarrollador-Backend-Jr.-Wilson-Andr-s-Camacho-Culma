import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { AdminGuard } from '../../guards/admin.guard';

@Controller('api/stats')
@UseGuards(JwtAuthGuard, AdminGuard)
export class StatsController {
  constructor(private statsService: StatsService) {}

  @Get()
  async getStats(@Request() req) {
    return this.statsService.getStats(req.user);
  }
}
