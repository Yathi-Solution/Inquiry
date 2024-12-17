import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma-services/prisma.service';
import { CreateUserInput } from './dto/create-user.dto';
import { UpdateUserInput } from './dto/update-user.dto';
import { FilterUserInput } from './dto/filter-user.dto';
import { Prisma, users } from '@prisma/client';
import { GetUsersByNameInput } from './dto/filter-name.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllUsers() {
    return this.prisma.users.findMany({
      include: { roles: true, locations: true },
    });
  }

  // async getAllUsers() {
  //   const users = await this.prisma.users.findMany({
  //     include: { roles: true, locations: true },
  //   });
  //   console.log('Fetched users-services:', users); // Log the users to see their structure
  //   return users;
  // }

  async getUserById(id: number) {
    const user = await this.prisma.users.findUnique({
      where: { user_id: id },
      include: { roles: true, locations: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async createUser(createUserInput: CreateUserInput) {
    const { password, ...rest } = createUserInput;
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await this.prisma.users.findUnique({
      where: { email: rest.email },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    return this.prisma.users.create({
      data: {
        ...rest,
        password: hashedPassword,
      },
      include: { roles: true, locations: true },
    });
  }

  async updateUser(updateUserInput: UpdateUserInput) {
    const { user_id, password, ...rest } = updateUserInput;
    const data: any = { ...rest };

    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    return this.prisma.users.update({
      where: { user_id },
      data,
      include: { roles: true, locations: true },
    });
  }

  async deleteUser(id: number) {
    await this.prisma.users.delete({
      where: { user_id: id },
    });
    return true;
  }

  async getUsersByLocationAndRole(filter?: FilterUserInput) {
    const whereConditions: Prisma.usersWhereInput = {};

    if (filter?.location_id) {
      whereConditions.location_id = filter.location_id;
    }

    if (filter?.role_id) {
      whereConditions.role_id = filter.role_id;
    }

    return this.prisma.users.findMany({
      where: whereConditions,
      include: {
        roles: true,
        locations: true,
      },
    });
  }

  async getUsersByName(filter?: GetUsersByNameInput): Promise<users[]> {
    const where: Prisma.usersWhereInput = filter?.name
      ? {
          name: {
            contains: filter.name,
            mode: Prisma.QueryMode.insensitive,
          },
        }
      : {};

    return this.prisma.users.findMany({
      where,
      orderBy: filter?.sortByName
        ? { name: filter.sortByName }
        : undefined,
    });
  }

  async deleteUsers(userIds: number[]): Promise<number[]> {
    await this.prisma.users.deleteMany({
      where: {
        user_id: {
          in: userIds
        }
      }
    });
    return userIds;
  }

  async getLocationUsers(managerId: number) {
    const manager = await this.validateManager(managerId);
    return this.prisma.users.findMany({
      where: {
        location_id: manager.location_id,
        roles: { role_name: 'salesperson' }
      },
      include: {
        roles: true,
        locations: true,
        customers: {
          select: {
            customer_id: true,
            name: true,
            status: true,
            visit_date: true,
          }
        },
        _count: { select: { customers: true } }
      },
    });
  }

  async getSalespersonDetails(managerId: number, salespersonId: number) {
    const manager = await this.validateManager(managerId);
    const salesperson = await this.prisma.users.findFirst({
      where: {
        user_id: salespersonId,
        location_id: manager.location_id,
        roles: { role_name: 'salesperson' }
      },
      include: {
        roles: true,
        locations: true,
        customers: {
          include: { locations: true },
          orderBy: { created_at: 'desc' }
        },
        _count: { select: { customers: true } }
      },
    });

    if (!salesperson) {
      throw new ForbiddenException('Salesperson not found or unauthorized access');
    }
    return salesperson;
  }

  private async validateManager(managerId: number) {
    const manager = await this.prisma.users.findUnique({
      where: { user_id: managerId },
      include: { roles: true }
    });

    if (!manager || manager.roles?.role_name !== 'location-manager') {
      throw new ForbiddenException('Unauthorized access');
    }
    return manager;
  }
}