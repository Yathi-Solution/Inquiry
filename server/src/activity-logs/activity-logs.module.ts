import { Module } from '@nestjs/common';
import { ActivityLogsService } from './activity-logs.service';
import { ActivityLogsResolver } from './activity-logs.resolver';
import { PrismaModule } from '../prisma-services/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ActivityLogsService, ActivityLogsResolver],
  exports: [ActivityLogsService],
})
export class ActivityLogsModule {}
