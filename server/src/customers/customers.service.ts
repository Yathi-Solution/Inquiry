// src/customers/customers.service.ts
import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma-services/prisma.service';
import { CreateCustomerInput } from './dto/create-customer.input';
import { UpdateCustomerInput } from './dto/update-customer.input';
import { FilterCustomersInput } from './dto/filter-customers.input';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async createCustomer(userId: number, input: CreateCustomerInput) {
    // Verify user is a salesperson
    const user = await this.prisma.user.findUnique({
      where: { user_id: userId },
      include: { role: true },
    });

    if (!user || user.role?.role_name !== 'salesperson') {
      throw new ForbiddenException('Only salespersons can create customers');
    }

    return this.prisma.customer.create({
      data: {
        name: input.name,
        email: input.email,
        phone: input.phone,
        location_id: input.location_id,
        salesperson_id: userId,
        visit_date: input.visit_date,
        notes: input.notes,
      },
      include: {
        location: true,
        salesperson: {
          select: {
            user_id: true,
            name: true,
            email: true,
            location_id: true,
          },
        },
      },
    });
  }

  async getCustomers(userId: number, filter?: FilterCustomersInput) {
    const user = await this.prisma.user.findUnique({
      where: { user_id: userId },
      include: { role: true },
    });

    let whereClause: any = {};

    // Apply filters if provided
    if (filter) {
      if (filter.search) {
        whereClause.OR = [
          { name: { contains: filter.search, mode: 'insensitive' } },
          { email: { contains: filter.search, mode: 'insensitive' } },
          { phone: { contains: filter.search, mode: 'insensitive' } },
        ];
      }
      if (filter.location_id) {
        whereClause.location_id = filter.location_id;
      }
      if (filter.status) {
        whereClause.status = filter.status;
      }
      if (filter.from_date && filter.to_date) {
        whereClause.visit_date = {
          gte: filter.from_date,
          lte: filter.to_date,
        };
      }
    }

    // Role-based filtering
    switch (user?.role?.role_name) {
      case 'super-admin':
        // Can see all customers
        break;
      case 'location-manager':
        whereClause.location_id = user.location_id;
        break;
      case 'salesperson':
        whereClause.salesperson_id = userId;
        break;
      default:
        throw new ForbiddenException('Unauthorized access');
    }

    return this.prisma.customer.findMany({
      where: whereClause,
      include: {
        location: true,
        salesperson: {
          select: {
            user_id: true,
            name: true,
            email: true,
            location_id: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async updateCustomer(userId: number, customerId: number, input: UpdateCustomerInput) {
    const user = await this.prisma.user.findUnique({
      where: { user_id: userId },
      include: { role: true },
    });

    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new ForbiddenException('Customer not found');
    }

    // Check permissions
    if (
      user.role?.role_name === 'salesperson' &&
      customer.salesperson_id !== userId
    ) {
      throw new ForbiddenException('Can only update own customers');
    }

    return this.prisma.customer.update({
      where: { id: customerId },
      data: input,
      include: {
        location: true,
        salesperson: {
          select: {
            user_id: true,
            name: true,
            email: true,
            location_id: true,
          },
        },
      },
    });
  }
}

