// src/customers/customers.resolver.ts
import { Resolver, Query, Args, Mutation, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CustomersService } from './customers.service';
import { FilterCustomersInput } from './dto/filter-customers.dto';
import { CustomerDto } from './dto/customer.dto';
import { CreateCustomerInput } from './dto/create-customer.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { GraphQLError } from 'graphql';
import { PrismaService } from '../prisma-services/prisma.service';
import { Int } from '@nestjs/graphql';
import { ActivityLog } from 'src/activity-logs/models/activity-log.model';
import { UpdateCustomerInput } from './dto/update-customer.dto';

@Resolver(() => CustomerDto)
export class CustomersResolver {
  constructor(
    private readonly customersService: CustomersService,
    private readonly prisma: PrismaService,
  ) {}

  @Query(() => [CustomerDto])
  @UseGuards(JwtAuthGuard)
  async getCustomers(
    @Context() context: any,
    @Args('filters', { nullable: true }) filters?: FilterCustomersInput
  ) {
    const user = context.req.user;
    if (!user) {
      throw new GraphQLError('User not authenticated');
    }

    // Debug log
    console.log('User data:', {
      user_id: user.user_id,
      role_id: user.role_id,
      role_name: user.role_name
    });

    // Fetch user with role information if role_name is missing
    if (!user.role_name) {
      const userWithRole = await this.prisma.users.findUnique({
        where: { user_id: user.user_id },
        include: { roles: true }
      });

      if (!userWithRole) {
        throw new GraphQLError('User not found');
      }

      user.role_name = userWithRole.roles.role_name;
    }

    return this.customersService.getCustomers(user.user_id, user.role_name, filters);
  }

  @Query(() => Int)
  @UseGuards(JwtAuthGuard)
  async getCustomersCount(
    @Context() context: any,
    @Args('filters', { nullable: true }) filters?: FilterCustomersInput
  ) {
    const user = context.req.user;
    if (!user) {
      throw new GraphQLError('User not authenticated');
    }

    // Fetch user with role information if role_name is missing
    if (!user.role_name) {
      const userWithRole = await this.prisma.users.findUnique({
        where: { user_id: user.user_id },
        include: { roles: true }
      });

      if (!userWithRole) {
        throw new GraphQLError('User not found');
      }

      user.role_name = userWithRole.roles.role_name;
    }

    return this.customersService.getCustomersCount(user.user_id, user.role_name, filters);
  }

  @Mutation(() => CustomerDto)
  @UseGuards(JwtAuthGuard)
  async createCustomer(
    @Args('createCustomerInput') createCustomerInput: CreateCustomerInput,
    @Context() context: any,
  ) {
    const user = context.req?.user;
    if (!user) {
      throw new GraphQLError('User not authenticated', {
        extensions: { code: 'UNAUTHENTICATED' },
      });
    }

    // Debug log
    console.log('User data before:', {
      user_id: user.user_id,
      role_id: user.role_id,
      role_name: user.role_name
    });

    // Fetch user with role information
    const userWithRole = await this.prisma.users.findUnique({
      where: { user_id: user.user_id },
      include: { roles: true }
    });

    if (!userWithRole) {
      throw new GraphQLError('User not found', {
        extensions: { code: 'USER_NOT_FOUND' },
      });
    }

    // Update user object with role information
    user.role_name = userWithRole.roles.role_name;

    console.log('User data after:', {
      user_id: user.user_id,
      role_id: user.role_id,
      role_name: user.role_name
    });

    try {
      return await this.customersService.createCustomer(createCustomerInput, user);
    } catch (error) {
      throw new GraphQLError(error.message, {
        extensions: { code: 'CREATE_CUSTOMER_ERROR' },
      });
    }
  }

  @Query(() => [ActivityLog])
  @UseGuards(JwtAuthGuard)
  async getCustomerLogs(
    @Args('customerId', { type: () => Int }) customerId: number,
    @CurrentUser() currentUser: any
  ) {
    return this.customersService.getCustomerLogs(customerId, currentUser);
  }

  @Mutation(() => CustomerDto)
  @UseGuards(JwtAuthGuard)
  async updateCustomer(
    @Args('customerId', { type: () => Int }) customerId: number,
    @Args('updateData') updateData: UpdateCustomerInput,
    @CurrentUser() currentUser: any
  ) {
    return this.customersService.updateCustomer(customerId, updateData, currentUser);
  }

  @Mutation(() => CustomerDto)
  @UseGuards(JwtAuthGuard)
  async updateVisitDate(
    @Args('customerId', { type: () => Int }) customerId: number,
    @Args('newVisitDate') newVisitDate: Date,
    @CurrentUser() currentUser: any
  ) {
    return this.customersService.updateVisitDate(customerId, newVisitDate, currentUser);
  }

  @Mutation(() => CustomerDto)
  @UseGuards(JwtAuthGuard)
  async reassignCustomer(
    @Args('customerId', { type: () => Int }) customerId: number,
    @Args('newSalespersonId', { type: () => Int }) newSalespersonId: number,
    @CurrentUser() currentUser: any
  ) {
    return this.customersService.reassignCustomer(customerId, newSalespersonId, currentUser);
  }
}
