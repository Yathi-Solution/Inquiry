// src/customers/customers.resolver.ts
import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { Customer } from './models/customer.model';
import { CreateCustomerInput } from './dto/create-customer.input';
import { UpdateCustomerInput } from './dto/update-customer.input';
import { FilterCustomersInput } from './dto/filter-customers.input';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Resolver(() => Customer)
export class CustomersResolver {
  constructor(private readonly customersService: CustomersService) {}

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Customer)
  async createCustomer(
    @CurrentUser() user: any,
    @Args('input') input: CreateCustomerInput,
  ) {
    return this.customersService.createCustomer(user.user_id, input);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => [Customer])
  async getCustomers(
    @CurrentUser() user: any,
    @Args('filter', { nullable: true }) filter?: FilterCustomersInput,
  ) {
    return this.customersService.getCustomers(user.user_id, filter);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Customer)
  async updateCustomer(
    @CurrentUser() user: any,
    @Args('customerId') customerId: number,
    @Args('input') input: UpdateCustomerInput,
  ) {
    return this.customersService.updateCustomer(user.user_id, customerId, input);
  }
}