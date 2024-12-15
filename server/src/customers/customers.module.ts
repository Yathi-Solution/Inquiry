// src/customers/customers.module.ts
import { Module } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CustomersResolver } from './customers.resolver';
import { PrismaModule } from '../prisma-services/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [CustomersService, CustomersResolver],
  exports: [CustomersService],
})
export class CustomersModule {}