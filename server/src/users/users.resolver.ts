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
import { ChangePasswordInput } from './dto/change-password.dto';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @Query(() => [User], { name: 'users' })
  async getAllUsers() {
    return this.usersService.getAllUsers();
  }
//   @UseGuards(JwtAuthGuard, RolesGuard)
// @Roles(1, 2)
// @Query(() => [User], { name: 'users' })
// async getAllUsers() {
//   const users = await this.usersService.getAllUsers();
//   console.log('Fetched users:', JSON.stringify(users, null, 2)); // Log the users
//   return users; // This returns the user data to the GraphQL layer
// }

  @UseGuards(JwtAuthGuard)
  @Query(() => User, { name: 'user' })
  async getUserById(@Args('id') id: number, @CurrentUser() user: any) {
    return this.usersService.getUserById(id);
  }

  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('super-admin', 'location-manager')
  @Mutation(() => User)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(1, 2)
  async createUser(
    @Args('createUserInput') createUserInput: CreateUserInput,
    @CurrentUser() currentUser: any
  ) {
    return this.usersService.createUser(createUserInput, currentUser);
  }

  @Mutation(() => User)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  async updateUser(
    @Args('updateUserInput') updateUserInput: UpdateUserInput,
    @CurrentUser() currentUser: any
  ) {
    return this.usersService.updateUser(updateUserInput, currentUser);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1)
  async deleteUser(
    @Args('id') id: number,
    @CurrentUser() currentUser: any
  ) {
    return this.usersService.deleteUser(id, currentUser);
  }

  @Query(() => [User])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  async getUsersByLocationAndRole(
    @CurrentUser() currentUser: any,
    @Args('filter', { nullable: true }) filter?: FilterUserInput
  ) {
    return this.usersService.getUsersByLocationAndRole(filter, currentUser);
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
  async deleteUsers(
    @Args('userIds', { type: () => [Int] }) userIds: number[],
    @CurrentUser() currentUser: any
  ) {
    return this.usersService.deleteUsers(userIds, currentUser);
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

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @CurrentUser() currentUser: any,
    @Args('input') input: ChangePasswordInput
  ) {
    return this.usersService.changePassword(
      currentUser.user_id, 
      input.oldPassword, 
      input.newPassword,
      currentUser
    );
  }
}