// src/customers/customers.service.ts
import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma-services/prisma.service';
import { Prisma, customers } from '@prisma/client';
import { CreateCustomerInput } from './dto/create-customer.dto';
import { FilterCustomersInput } from './dto/filter-customers.dto';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';

@Injectable()
export class CustomersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityLogsService: ActivityLogsService
  ) {}

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

    const customer = await this.prisma.customers.create({
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

    await this.activityLogsService.createLog(user.user_id, {
      activity: `Created new customer - ${customer.name} (assigned to ${customer.users.name} at ${customer.locations.location_name})`,
      log_type: 'CUSTOMER'
    });

    return customer;
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

  async updateCustomerStatus(customerId: number, status: string, user: any) {
    const oldCustomer = await this.prisma.customers.findUnique({
      where: { customer_id: customerId },
      include: { users: true, locations: true }
    });

    // Role-based validation
    switch(user.role_name.toLowerCase()) {
      case 'salesperson':
        if (oldCustomer.salesperson_id !== user.user_id) {
          throw new ForbiddenException('You can only update your own customers');
        }
        break;
      case 'location-manager':
        if (oldCustomer.location_id !== user.location_id) {
          throw new ForbiddenException('You can only update customers in your location');
        }
        break;
      case 'super-admin':
        // Can update any customer
        break;
      default:
        throw new ForbiddenException('Unauthorized');
    }

    const updatedCustomer = await this.prisma.customers.update({
      where: { customer_id: customerId },
      data: { status },
      include: { users: true, locations: true }
    });

    await this.activityLogsService.createLog(user.user_id, {
      activity: `Updated status for customer ${oldCustomer.name} from ${oldCustomer.status} to ${status}`,
      log_type: 'CUSTOMER'
    });

    return updatedCustomer;
  }

  async getCustomerLogs(customerId: number, user: any) {
    const customer = await this.prisma.customers.findUnique({
      where: { customer_id: customerId },
      include: { users: true }
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Role-based access control for logs
    const where: Prisma.activity_logsWhereInput = {
      log_type: 'CUSTOMER'
    };

    switch(user.role_name.toLowerCase()) {
      case 'super-admin':
        // Can see all logs for this customer
        break;
      case 'location-manager':
        if (customer.location_id !== user.location_id) {
          throw new ForbiddenException('Cannot access logs for customers outside your location');
        }
        where.users = {
          location_id: user.location_id
        };
        break;
      case 'salesperson':
        if (customer.salesperson_id !== user.user_id) {
          throw new ForbiddenException('Cannot access logs for customers not assigned to you');
        }
        where.user_id = user.user_id;
        break;
      default:
        throw new ForbiddenException('Unauthorized');
    }

    return this.activityLogsService.getLogs({
      log_type: 'CUSTOMER',
      customer_id: customerId
    }, user);
  }

  async updateCustomer(customerId: number, updateData: any, user: any) {
    const oldCustomer = await this.prisma.customers.findUnique({
      where: { customer_id: customerId },
      include: { users: true, locations: true }
    });

    // Role-based validation (reusing existing logic)
    this.validateUserAccess(user, oldCustomer);

    const updatedCustomer = await this.prisma.customers.update({
      where: { customer_id: customerId },
      data: updateData,
      include: { users: true, locations: true }
    });

    // Log specific changes
    const changes = [];
    if (updateData.visit_date && updateData.visit_date !== oldCustomer.visit_date) {
      changes.push(`visit date to ${new Date(updateData.visit_date).toLocaleDateString()}`);
    }
    if (updateData.salesperson_id && updateData.salesperson_id !== oldCustomer.salesperson_id) {
      changes.push(`assigned salesperson from ${oldCustomer.users.name} to ${updatedCustomer.users.name}`);
    }
    if (updateData.notes && updateData.notes !== oldCustomer.notes) {
      changes.push('notes');
    }
    if (updateData.phone && updateData.phone !== oldCustomer.phone) {
      changes.push('contact information');
    }

    await this.activityLogsService.createLog(user.user_id, {
      activity: `Updated customer ${oldCustomer.name}: ${changes.join(', ')}`,
      log_type: 'CUSTOMER'
    });

    return updatedCustomer;
  }

  async updateVisitDate(customerId: number, newVisitDate: Date, user: any) {
    const customer = await this.prisma.customers.findUnique({
      where: { customer_id: customerId },
      include: { users: true }
    });

    this.validateUserAccess(user, customer);

    const updatedCustomer = await this.prisma.customers.update({
      where: { customer_id: customerId },
      data: { visit_date: newVisitDate },
      include: { users: true }
    });

    await this.activityLogsService.createLog(user.user_id, {
      activity: `Updated visit date for customer ${customer.name} to ${newVisitDate.toLocaleDateString()}`,
      log_type: 'CUSTOMER'
    });

    return updatedCustomer;
  }

  async reassignCustomer(customerId: number, newSalespersonId: number, user: any) {
    const customer = await this.prisma.customers.findUnique({
      where: { customer_id: customerId },
      include: { users: true }
    });

    const newSalesperson = await this.prisma.users.findUnique({
      where: { user_id: newSalespersonId }
    });

    this.validateUserAccess(user, customer);

    const updatedCustomer = await this.prisma.customers.update({
      where: { customer_id: customerId },
      data: { salesperson_id: newSalespersonId },
      include: { users: true }
    });

    await this.activityLogsService.createLog(user.user_id, {
      activity: `Reassigned customer ${customer.name} from ${customer.users.name} to ${newSalesperson.name}`,
      log_type: 'CUSTOMER'
    });

    return updatedCustomer;
  }

  private validateUserAccess(user: any, customer: any) {
    switch(user.role_name.toLowerCase()) {
      case 'salesperson':
        if (customer.salesperson_id !== user.user_id) {
          throw new ForbiddenException('You can only modify your own customers');
        }
        break;
      case 'location-manager':
        if (customer.location_id !== user.location_id) {
          throw new ForbiddenException('You can only modify customers in your location');
        }
        break;
      case 'super-admin':
        // Can modify any customer
        break;
      default:
        throw new ForbiddenException('Unauthorized');
    }
  }
}