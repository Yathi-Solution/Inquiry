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

@Resolver(() => CustomerDto)
export class CustomersResolver {
  constructor(
    private readonly customersService: CustomersService,
    private readonly prisma: PrismaService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Query(() => [CustomerDto], { name: 'getCustomersBySalespersonId' }) // Ensure the name matches
  async getCustomersBySalespersonId(
    @CurrentUser() user: any,
    @Args('filter', { nullable: true }) filter?: FilterCustomersInput,
  ) {
    return this.customersService.getCustomers(
      filter,
      user.user_id,
      user.role_name,
    );
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
}
