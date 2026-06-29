import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { AdminGuard } from '../../guards/admin.guard';
import { AuthenticatedUser } from '../../types/authenticated-user';

@Controller('stats')
@UseGuards(JwtAuthGuard, AdminGuard)
export class StatsController {
  constructor(private statsService: StatsService) {}

  @Get()
  async getStats(@Request() req: { user: AuthenticatedUser }) {
    return this.statsService.getStats(req.user);
  }
}
