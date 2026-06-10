import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './modules/prisma/prisma.service';

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('health')
  async health() {
    await this.prisma.$queryRaw`SELECT 1`;

    return {
      status: 'ok',
      database: 'ok',
      service: 'dna-music-api',
      timestamp: new Date().toISOString(),
    };
  }
}
