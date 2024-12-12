import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserInput } from './dto/create-user.dto';
import { UpdateUserInput } from './dto/update-user.dto';
import { FilterUserInput } from './dto/filter-user.dto';
import { Prisma, User } from '@prisma/client';
import { GetUsersByNameInput } from './dto/filter-name.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // Get all users
  async getAllUsers() {
    return this.prisma.user.findMany({
      include: { role: true, location: true },  // Include related data (role, location)
    });
  }

  // Get a single user by ID
  async getUserById(id: number) {
    return this.prisma.user.findUnique({
      where: { user_id: id },
      include: { role: true, location: true },  // Include related data (role, location)
    });
  }

  // Create a new user
  async createUser(createUserInput: CreateUserInput) {
    const { name, email, password, role_id, location_id } = createUserInput;

    return this.prisma.user.create({
      data: {
        name,
        email,
        password,
        role_id,
        location_id,
      },
    });
  }

  // Update an existing user
  async updateUser(updateUserInput: UpdateUserInput) {
    const { user_id, name, email, password, role_id, location_id } = updateUserInput;

    return this.prisma.user.update({
      where: { user_id },
      data: {
        name,
        email,
        password,
        role_id,
        location_id,
      },
    });
  }

  // Delete a user
  async deleteUser(id: number) {
    return this.prisma.user.delete({
      where: { user_id: id },
    });
  }

  async getUsersByLocationAndRole(filter?: FilterUserInput) {
    const whereConditions: Prisma.UserWhereInput = {};

    if (filter?.location_id) {
      whereConditions.location_id = filter.location_id;
    }

    if (filter?.role_id) {
      whereConditions.role_id = filter.role_id;
    }

    return this.prisma.user.findMany({
      where: whereConditions,
      include: {
        role: true,
        location: true,
      },
    });
  }


  async getUsersByName(filter?: GetUsersByNameInput): Promise<User[]> {
    // Construct the where condition based on filter (optional)
    const where: Prisma.UserWhereInput = filter?.name
      ? {
          name: {
            contains: filter.name, // Filter by name
            mode: Prisma.QueryMode.insensitive, // Use Prisma.QueryMode to specify the case-insensitive search
          },
        }
      : {};

    return this.prisma.user.findMany({
      where,
      orderBy: filter?.sortByName
        ? { name: filter.sortByName } // Sort by name if sorting is provided
        : undefined,
    });
  }
}
