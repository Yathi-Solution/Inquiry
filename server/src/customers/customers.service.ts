// src/customers/customers.service.ts
import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma-services/prisma.service';
import { Prisma, customers } from '@prisma/client';
import { CreateCustomerInput } from './dto/create-customer.dto';
import { FilterCustomersInput } from './dto/filter-customers.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async getCustomers(
    userId: number, 
    userRole: string,
    filters?: FilterCustomersInput
  ) {
    const whereConditions: Prisma.customersWhereInput = {};

    // Debug log initial state
    console.log('Initial request:', { userId, userRole, filters });

    // Role-based conditions
    const role = userRole.toLowerCase();
    switch (role) {
      case 'super-admin':
        console.log('Super-admin access');
        if (filters?.location_id) {
          whereConditions.location_id = filters.location_id;
        }
        if (filters?.salesperson_id) {
          whereConditions.salesperson_id = filters.salesperson_id;
        }
        break;

      case 'location-manager':
        console.log('Location-manager access');
        const manager = await this.prisma.users.findUnique({
          where: { user_id: userId }
        });
        if (!manager) {
          throw new ForbiddenException('Manager not found');
        }
        console.log('Manager location:', manager.location_id);
        whereConditions.location_id = manager.location_id;
        if (filters?.salesperson_id) {
          whereConditions.salesperson_id = filters.salesperson_id;
        }
        break;

      case 'salesperson':
        console.log('Salesperson access');
        whereConditions.salesperson_id = userId;
        break;
    }

    // Debug log final conditions
    console.log('Final where conditions:', whereConditions);

    const result = await this.prisma.customers.findMany({
      where: whereConditions,
      include: {
        locations: true,
        users: true,
      },
      orderBy: filters?.sortBy 
        ? { [filters.sortBy]: filters.sortOrder || 'asc' }
        : { created_at: 'desc' }
    });

    // Debug log result count
    console.log('Found customers count:', result.length);

    return result;
  }

  async createCustomer(createCustomerInput: CreateCustomerInput, user: any) {
    if (!user || !user.role_name) {
      throw new ForbiddenException('User not authenticated or role not found');
    }

    // Check for existing email first
    const existingCustomer = await this.prisma.customers.findFirst({
      where: { email: createCustomerInput.email }
    });

    if (existingCustomer) {
      throw new Error('A customer with this email already exists');
    }

    const { location_id, salesperson_id, ...customerData } = createCustomerInput;
    let finalSalespersonId: number;
    let finalLocationId: number;

    const userRole = user.role_name.toLowerCase();

    console.log('Creating customer with:', {
      userRole,
      salesperson_id,
      location_id,
      userId: user.user_id
    });

    switch (userRole) {
      case 'super-admin':
        // Super-admin can assign to any salesperson
        const assignedUser = await this.prisma.users.findFirst({
          where: {
            user_id: salesperson_id,
            role_id: 3  // Only salesperson role
          }
        });

        if (!assignedUser) {
          throw new Error(`User ID ${salesperson_id} must be a salesperson`);
        }

        finalSalespersonId = salesperson_id;
        finalLocationId = location_id;
        break;

      case 'location-manager':
        // Location manager can only use their location
        const manager = await this.prisma.users.findUnique({
          where: { user_id: user.user_id }
        });

        if (!manager) {
          throw new Error('Manager not found');
        }

        // Can only assign to salespeople in their location
        const assignedSalesperson = await this.prisma.users.findFirst({
          where: {
            user_id: salesperson_id,
            role_id: 3,  // Must be a salesperson
            location_id: manager.location_id  // Must be in same location
          }
        });

        if (!assignedSalesperson) {
          throw new Error(`Invalid salesperson ID. Must be a salesperson from your location`);
        }

        finalSalespersonId = salesperson_id;
        finalLocationId = manager.location_id;
        break;

      case 'salesperson':
        // Salesperson can only create for themselves
        const salesperson = await this.prisma.users.findUnique({
          where: { user_id: user.user_id }
        });

        if (!salesperson) {
          throw new Error('Salesperson not found');
        }

        finalSalespersonId = user.user_id;
        finalLocationId = salesperson.location_id;
        break;

      default:
        throw new ForbiddenException('You do not have permission to create a customer');
    }

    return this.prisma.customers.create({
      data: {
        name: customerData.name,
        email: customerData.email,
        phone: customerData.phone,
        visit_date: customerData.visit_date,
        notes: customerData.notes,
        status: customerData.status || 'pending',
        created_at: new Date(),
        updated_at: new Date(),
        locations: { connect: { location_id: finalLocationId } },
        users: { connect: { user_id: finalSalespersonId } }
      },
      include: {
        locations: true,
        users: true,
      },
    });
  }

  async getCustomersCount(
    userId: number, 
    userRole: string,
    filters?: FilterCustomersInput
  ): Promise<number> {
    const whereConditions: Prisma.customersWhereInput = {};

    // Role-based conditions
    const role = userRole.toLowerCase();
    switch (role) {
      case 'super-admin':
        if (filters?.location_id) {
          whereConditions.location_id = filters.location_id;
        }
        if (filters?.salesperson_id) {
          whereConditions.salesperson_id = filters.salesperson_id;
        }
        break;

      case 'location-manager':
        const manager = await this.prisma.users.findUnique({
          where: { user_id: userId }
        });
        if (!manager) {
          throw new ForbiddenException('Manager not found');
        }
        whereConditions.location_id = manager.location_id;
        if (filters?.salesperson_id) {
          whereConditions.salesperson_id = filters.salesperson_id;
        }
        break;

      case 'salesperson':
        whereConditions.salesperson_id = userId;
        break;
    }

    // Apply filters
    if (filters) {
      if (filters.name) {
        whereConditions.name = {
          contains: filters.name,
          mode: 'insensitive'
        };
      }
      if (filters.status) {
        whereConditions.status = filters.status;
      }
      if (filters.visitDateFrom || filters.visitDateTo) {
        whereConditions.visit_date = {
          ...(filters.visitDateFrom && { gte: filters.visitDateFrom }),
          ...(filters.visitDateTo && { lte: filters.visitDateTo })
        };
      }
      if (filters.createdAtFrom || filters.createdAtTo) {
        whereConditions.created_at = {
          ...(filters.createdAtFrom && { gte: filters.createdAtFrom }),
          ...(filters.createdAtTo && { lte: filters.createdAtTo })
        };
      }
    }

    return this.prisma.customers.count({
      where: whereConditions
    });
  }
}