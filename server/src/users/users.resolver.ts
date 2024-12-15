import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './models/user.model';
import { CreateUserInput } from './dto/create-user.dto';
import { UpdateUserInput } from './dto/update-user.dto';
import { FilterUserInput } from './dto/filter-user.dto';
import { GetUsersByNameInput } from './dto/filter-name.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @Query(() => [User], { name: 'users' })
  async getAllUsers() {
    return this.usersService.getAllUsers();
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => User, { name: 'user' })
  async getUserById(@Args('id') id: number, @CurrentUser() user: any) {
    return this.usersService.getUserById(id);
  }

  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('super-admin', 'location-manager')
  @Mutation(() => User)
  async createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.usersService.createUser(createUserInput);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @Mutation(() => User)
  async updateUser(@Args('updateUserInput') updateUserInput: UpdateUserInput) {
    return this.usersService.updateUser(updateUserInput);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @Mutation(() => Boolean)
  async deleteUser(@Args('id') id: number) {
    return this.usersService.deleteUser(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @Query(() => [User], { name: 'usersByLocationAndRole' })
  async getUsersByLocationAndRole(
    @Args('filter', { nullable: true }) filter?: FilterUserInput,
  ) {
    return this.usersService.getUsersByLocationAndRole(filter);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => [User])
  async getUsersByName(
    @Args('filter', { nullable: true }) filter?: GetUsersByNameInput,
  ) {
    return this.usersService.getUsersByName(filter);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @Mutation(() => [Int])
  async deleteUsers(@Args('userIds', { type: () => [Int] }) userIds: number[]) {
    return this.usersService.deleteUsers(userIds);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => [User])
  async getLocationUsers(@CurrentUser() user: any) {
    return this.usersService.getLocationUsers(user.user_id);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => User)
  async getSalespersonDetails(
    @CurrentUser() user: any,
    @Args('salespersonId', { type: () => Int }) salespersonId: number
  ) {
    return this.usersService.getSalespersonDetails(user.user_id, salespersonId);
  }
}
