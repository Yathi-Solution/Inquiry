import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma-services/prisma.service';
import { CreateUserInput } from './dto/create-user.dto';
import { UpdateUserInput } from './dto/update-user.dto';
import { FilterUserInput } from './dto/filter-user.dto';
import { Prisma, users } from '@prisma/client';
import { GetUsersByNameInput } from './dto/filter-name.dto';
import * as bcrypt from 'bcrypt';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityLogsService: ActivityLogsService
  ) {}

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

  async createUser(createUserInput: CreateUserInput, currentUser?: any) {
    const { password, ...userData } = createUserInput;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const user = await this.prisma.users.create({
        data: {
          ...userData,
          password: hashedPassword,
        },
        include: {
          roles: true,
          locations: true,
        },
      });

      return user;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new Error('User with this email already exists');
      }
      throw error;
    }
  }

  async updateUser(updateUserInput: UpdateUserInput, currentUser: any) {
    const user = await this.prisma.users.update({
      where: { user_id: updateUserInput.user_id },
      data: updateUserInput,
      include: { roles: true, locations: true },
    });

    await this.activityLogsService.createLog(currentUser.user_id, {
      activity: `Updated user - ${user.email}`,
      log_type: 'USER_MGMT'
    });

    return user;
  }

  async deleteUser(id: number, currentUser: any) {
    const user = await this.prisma.users.findUnique({
      where: { user_id: id }
    });

    await this.prisma.users.delete({
      where: { user_id: id },
    });

    await this.activityLogsService.createLog(currentUser.user_id, {
      activity: `Deleted user - ${user.email}`,
      log_type: 'USER_MGMT'
    });

    return true;
  }

  async getUsersByLocationAndRole(filter: FilterUserInput, currentUser: any) {
    const users = await this.prisma.users.findMany({
      where: {
        ...(filter?.location_id && { location_id: filter.location_id }),
        ...(filter?.role_id && { role_id: filter.role_id }),
      },
      include: { roles: true, locations: true },
    });

    await this.activityLogsService.createLog(currentUser.user_id, {
      activity: `Filtered users by location:${filter?.location_id} and role:${filter?.role_id}`,
      log_type: 'USER_MGMT'
    });

    return users;
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

  async deleteUsers(userIds: number[], currentUser: any): Promise<number[]> {
    const users = await this.prisma.users.findMany({
      where: { user_id: { in: userIds } }
    });

    await this.prisma.users.deleteMany({
      where: { user_id: { in: userIds } }
    });

    await this.activityLogsService.createLog(currentUser.user_id, {
      activity: `Bulk deleted users - ${users.map(u => u.email).join(', ')}`,
      log_type: 'USER_MGMT'
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

  async changePassword(userId: number, oldPassword: string, newPassword: string, currentUser: any) {
    const user = await this.prisma.users.findUnique({
      where: { user_id: userId },
      include: {
        roles: true,
        locations: true
      }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify old password
    const isValidPassword = await bcrypt.compare(oldPassword, user.password);
    if (!isValidPassword) {
      // Log failed attempt
      await this.activityLogsService.createLog(currentUser.user_id, {
        activity: `Failed password change attempt for user - ${user.email} (Invalid current password)`,
        log_type: 'USER_MGMT'
      });
      throw new ForbiddenException('Current password is incorrect');
    }

    // Update with new hashed password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.users.update({
      where: { user_id: userId },
      data: { password: hashedPassword }
    });

    // Log successful password change
    await this.activityLogsService.createLog(currentUser.user_id, {
      activity: `Password successfully changed for user - ${user.email} (${user.roles.role_name} at ${user.locations.location_name})`,
      log_type: 'USER_MGMT'
    });

    return true;
  }
}