import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RolesModule } from './roles/roles.module';
import { UsersModule } from './users/users.module';
import { LocationsModule } from './locations/locations.module';
import { SalespersonAssignmentsModule } from './salesperson-assignments/salesperson-assignments.module';
import { ActivityLogsModule } from './activity-logs/activity-logs.module';
import { PrismaModule } from './prisma-services/prisma.module';
import { GraphQLModule } from '@nestjs/graphql';  
import { ApolloDriverConfig, ApolloDriver } from '@nestjs/apollo'; 
import { AuthModule } from './auth/auth.module';
import { CustomersModule } from './customers/customers.module';

@Module({
  imports: [
    AuthModule,
    RolesModule,
    UsersModule,
    LocationsModule,
    CustomersModule,
    SalespersonAssignmentsModule,
    ActivityLogsModule,
    PrismaModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({  
      driver: ApolloDriver,  
      autoSchemaFile: true,  
      playground: true,      
      path: 'graphql',    
      context: ({ req }:any) => ({ req }),   
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}