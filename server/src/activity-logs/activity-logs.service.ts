import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma-services/prisma.service';
import { CreateActivityLogInput } from './dto/create-activity-log.dto';
import { FilterActivityLogInput } from './dto/filter-activity-log.dto';
import { ActivityLog } from './models/activity-log.model';
import { Prisma } from '@prisma/client';

@Injectable()
export class ActivityLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async createLog(userId: number, input: CreateActivityLogInput): Promise<ActivityLog> {
    return this.prisma.activity_logs.create({
      data: {
        user_id: userId,
        activity: input.activity,
        log_type: input.log_type,
      },
      include: {
        users: {
          include: {
            roles: true,
            locations: true
          }
        }
      }
    }) as unknown as ActivityLog;
  }

  async getLogs(filter: FilterActivityLogInput, currentUser: any): Promise<ActivityLog[]> {
    const where: Prisma.activity_logsWhereInput = {};

    // Role-based filtering
    switch(currentUser.role_id) {
      case 1: // Super Admin
        // Can see all logs
        break;
        
      case 2: // Location Manager
        where.OR = [
          { log_type: 'ASSIGNMENT' },
          { log_type: 'CUSTOMER' },
          { log_type: 'LOCATION' }
        ];
        // Only see logs related to their location
        where.users = {
          location_id: currentUser.location_id
        };
        break;
        
      case 3: // Salesperson
        where.OR = [
          { log_type: 'CUSTOMER', user_id: currentUser.user_id },
          { log_type: 'AUTH', user_id: currentUser.user_id }
        ];
        break;
    }

    // Apply additional filters
    if (filter?.user_id && currentUser.role_id === 1) {
      where.user_id = filter.user_id;
    }

    if (filter?.log_type && this.isAllowedLogType(filter.log_type, currentUser.role_id)) {
      where.log_type = filter.log_type;
    }

    if (filter?.activity) {
      where.activity = { contains: filter.activity, mode: 'insensitive' };
    }

    if (filter?.start_date || filter?.end_date) {
      where.created_at = {};
      if (filter.start_date) where.created_at.gte = filter.start_date;
      if (filter.end_date) where.created_at.lte = filter.end_date;
    }

    return this.prisma.activity_logs.findMany({
      where,
      include: {
        users: {
          include: {
            roles: true,
            locations: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });
  }

  async getLogById(activity_id: number): Promise<ActivityLog> {
    return this.prisma.activity_logs.findUnique({
      where: { activity_id },
      include: {
        users: {
          include: {
            roles: true,
            locations: true
          }
        }
      }
    }) as unknown as ActivityLog;
  }

  async getUserLogs(user_id: number): Promise<ActivityLog[]> {
    return this.prisma.activity_logs.findMany({
      where: { user_id },
      include: {
        users: {
          include: {
            roles: true,
            locations: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    }) as unknown as ActivityLog[];
  }

  private isAllowedLogType(logType: string, roleId: number): boolean {
    switch(roleId) {
      case 1: // Super Admin
        return true;
      case 2: // Location Manager
        return ['ASSIGNMENT', 'CUSTOMER', 'LOCATION'].includes(logType);
      case 3: // Salesperson
        return ['CUSTOMER', 'AUTH'].includes(logType);
      default:
        return false;
    }
  }
} 