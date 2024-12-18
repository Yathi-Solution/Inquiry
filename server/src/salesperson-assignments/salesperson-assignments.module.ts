import { Module } from '@nestjs/common';
import { SalespersonAssignmentsService } from './salesperson-assignments.service';
import { SalespersonAssignmentsResolver } from './salesperson-assignments.resolver';
import { PrismaModule } from '../prisma-services/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [SalespersonAssignmentsService, SalespersonAssignmentsResolver],
  exports: [SalespersonAssignmentsService],
})
export class SalespersonAssignmentsModule {}
