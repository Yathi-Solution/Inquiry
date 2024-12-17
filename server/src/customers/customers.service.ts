// src/customers/customers.service.ts
import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma-services/prisma.service';
import { FilterCustomersInput } from './dto/filter-customers.dto';
import { Prisma, customers } from '@prisma/client';
import { CreateCustomerInput } from './dto/create-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async getCustomers(filter: FilterCustomersInput, userId: number, userRole: string) {
    const whereConditions: Prisma.customersWhereInput = {};

    // Role-based filtering
    if (userRole === 'salesperson') {
      whereConditions.salesperson_id = userId; // Only see their own customers
    } else if (userRole === 'location-manager') {
      const manager = await this.prisma.users.findUnique({
        where: { user_id: userId },
        include: { locations: true },
      });
      if (!manager) throw new ForbiddenException('Unauthorized access');
      whereConditions.location_id = manager.location_id; // See customers in their location
    }

    // Apply filters
    if (filter.salesperson_id) {
      whereConditions.salesperson_id = filter.salesperson_id;
    }
    if (filter.location_id) {
      whereConditions.location_id = filter.location_id;
    }
    if (filter.name) {
      whereConditions.name = {
        contains: filter.name,
        mode: 'insensitive',
      };
    }
    if (filter.status) {
      whereConditions.status = filter.status;
    }

    // Fetch customers with sorting
    return this.prisma.customers.findMany({
      where: whereConditions,
      orderBy: filter.sortBy ? { [filter.sortBy]: 'asc' } : undefined,
      include: { locations: true, users: true }, // Include related data
    });
  }

  async createCustomer(createCustomerInput: CreateCustomerInput, user: any) {
    // Check if user exists and has role
    if (!user || !user.role_name) {
      throw new ForbiddenException('User not authenticated or role not found');
    }
    console.log('Checking role:', user.role_name); // Debug log

    // Allow access for these roles (note the hyphen in super-admin)
    const allowedRoles = ['super-admin', 'admin', 'location-manager', 'salesperson'];
    if (!allowedRoles.includes(user.role_name)) {
      throw new ForbiddenException(`You do not have permission to create a customer. Role: ${user.role_name}`);
    }

    const { location_id, salesperson_id, ...customerData } = createCustomerInput;

    // For admin, use the provided location_id and salesperson_id directly
    let finalLocationId = location_id;
    let finalSalespersonId = salesperson_id;

    // Only override IDs for location-manager and salesperson
    if (user.role_name === 'location-manager') {
      const manager = await this.prisma.users.findUnique({
        where: { user_id: user.user_id },
        include: { locations: true },
      });
      
      if (!manager) {
        throw new ForbiddenException('Manager not found');
      }
      
      finalLocationId = manager.location_id;
    }

    if (user.role_name === 'salesperson') {
      finalSalespersonId = user.user_id;
    }

    // Check for existing customer
    const existingCustomer = await this.prisma.customers.findFirst({
      where: { email: customerData.email },
    });

    if (existingCustomer) {
      throw new Error('Customer with this email already exists');
    }

    // Create the customer
    return this.prisma.customers.create({
      data: {
        ...customerData,
        locations: {
          connect: { location_id: finalLocationId }
        },
        users: {
          connect: { user_id: finalSalespersonId }
        },
        status: customerData.status || 'pending',
        created_at: new Date(),
        updated_at: new Date(),
      },
      include: {
        locations: true,
        users: true,
      },
    });
  }
}