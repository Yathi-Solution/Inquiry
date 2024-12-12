import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './models/user.model';
import { CreateUserInput } from './dto/create-user.dto';
import { UpdateUserInput } from './dto/update-user.dto';
import { FilterUserInput } from './dto/filter-user.dto';
import { GetUsersByNameInput } from './dto/filter-name.dto';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  // Get all users
  @Query(() => [User], { name: 'users' })
  async getAllUsers() {
    return this.usersService.getAllUsers();
  }

  // Get a single user by ID
  @Query(() => User, { name: 'user' })
  async getUserById(@Args('id') id: number) {
    return this.usersService.getUserById(id);
  }

  // Create a new user
  @Mutation(() => User)
  async createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.usersService.createUser(createUserInput);
  }

  // Update a user
  @Mutation(() => User)
  async updateUser(@Args('updateUserInput') updateUserInput: UpdateUserInput) {
    return this.usersService.updateUser(updateUserInput);
  }

  // Delete a user
  @Mutation(() => Boolean)
  async deleteUser(@Args('id') id: number) {
    return this.usersService.deleteUser(id);
  }

  @Query(() => [User], { name: 'usersByLocationAndRole' })
  async getUsersByLocationAndRole(
    @Args('filter', { nullable: true }) filter?: FilterUserInput,
  ) {
    return this.usersService.getUsersByLocationAndRole(filter);
  }

  @Query(() => [User]) // This will return an array of User objects
  async getUsersByName(
    @Args('filter', { nullable: true }) filter?: GetUsersByNameInput, // Filter input is optional
  ) {
    return this.usersService.getUsersByName(filter); // Delegate the query logic to the UsersService
  }
}
