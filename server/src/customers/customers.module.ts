   // src/customers/customers.module.ts
   import { Module } from '@nestjs/common';
   import { CustomersService } from './customers.service';
   import { CustomersResolver } from './customers.resolver';
   import { PrismaService } from '../prisma-services/prisma.service'; // Ensure PrismaService is imported

   @Module({
     providers: [CustomersService, CustomersResolver, PrismaService],
   })
   export class CustomersModule {}