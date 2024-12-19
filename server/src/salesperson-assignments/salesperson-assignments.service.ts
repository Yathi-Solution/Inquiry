import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma-services/prisma.service';
import { CreateAssignmentInput } from './dto/create-assignment.dto';
import { UpdateAssignmentStatusInput } from './dto/update-assignment.dto';
import { Assignment } from './models/assignment.model';
import { Prisma } from '@prisma/client';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';

@Injectable()
export class SalespersonAssignmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityLogsService: ActivityLogsService
  ) {}

  private generateAssignmentCode(userId: number, locationId: number): string {
    const year = new Date().getFullYear() % 100;
    const userSuffix = userId % 100;
    const locationSuffix = locationId % 100;
    return `${year}${locationSuffix.toString().padStart(2, '0')}${userSuffix.toString().padStart(2, '0')}`;
  }

  private async generateUniqueAssignmentCode(userId: number, locationId: number): Promise<string> {
    let code: string;
    let isUnique = false;
    
    while (!isUnique) {
      code = this.generateAssignmentCode(userId, locationId);
      const existing = await this.prisma.salesperson_assignments.findFirst({
        where: { assignment_code: code }
      });
      if (!existing) {
        isUnique = true;
      }
    }
    return code;
  }

  private async validateManagerPermissions(userId: number, locationId: number): Promise<void> {
    const manager = await this.prisma.users.findUnique({
      where: { user_id: userId }
    });

    if (manager.location_id !== locationId) {
      throw new ForbiddenException('You can only manage assignments in your location');
    }
  }

  private async validateSalesperson(userId: number): Promise<void> {
    const user = await this.prisma.users.findFirst({
      where: {
        user_id: userId,
        role_id: 3
      }
    });

    if (!user) {
      throw new ForbiddenException('Target user must be a salesperson');
    }
  }

  async createAssignment(createAssignmentInput: CreateAssignmentInput, currentUser: any) {
    const { user_id, location_id } = createAssignmentInput;

    const [user, location] = await Promise.all([
      this.prisma.users.findUnique({ where: { user_id } }),
      this.prisma.locations.findUnique({ where: { location_id } })
    ]);

    const assignment = await this.prisma.salesperson_assignments.create({
      data: {
        user_id,
        location_id,
        assignment_code: `${user_id}-${location_id}`,
      },
      include: {
        users: true,
        locations: true
      }
    });

    await this.activityLogsService.createLog(currentUser.user_id, {
      activity: `Created new assignment - ${user.name} assigned to ${location.location_name}`,
      log_type: 'ASSIGNMENT'
    });

    return assignment;
  }

  async updateAssignmentStatus(assignmentId: number, active: boolean, currentUser: any) {
    const assignment = await this.prisma.salesperson_assignments.findUnique({
      where: { assignment_id: assignmentId },
      include: { users: true, locations: true }
    });

    const updatedAssignment = await this.prisma.salesperson_assignments.update({
      where: { assignment_id: assignmentId },
      data: { status: active },
      include: { users: true, locations: true }
    });

    await this.activityLogsService.createLog(currentUser.user_id, {
      activity: `Updated assignment status - ${assignment.users.name} at ${assignment.locations.location_name} (${active ? 'activated' : 'deactivated'})`,
      log_type: 'ASSIGNMENT'
    });

    return updatedAssignment;
  }

  async deleteAssignment(assignmentId: number, currentUser: any) {
    const assignment = await this.prisma.salesperson_assignments.findUnique({
      where: { assignment_id: assignmentId },
      include: { users: true, locations: true }
    });

    await this.prisma.salesperson_assignments.delete({
      where: { assignment_id: assignmentId }
    });

    await this.activityLogsService.createLog(currentUser.user_id, {
      activity: `Removed assignment - ${assignment.users.name} from ${assignment.locations.location_name}`,
      log_type: 'ASSIGNMENT'
    });

    return true;
  }

  async getAssignmentLogs(assignmentId: number, currentUser: any) {
    const assignment = await this.prisma.salesperson_assignments.findUnique({
      where: { assignment_id: assignmentId },
      include: { users: true, locations: true }
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    // Role-based access control
    switch(currentUser.role_name.toLowerCase()) {
      case 'super-admin':
        // Can see all logs
        break;
      case 'location-manager':
        if (assignment.location_id !== currentUser.location_id) {
          throw new ForbiddenException('Cannot access logs for assignments outside your location');
        }
        break;
      case 'salesperson':
        if (assignment.user_id !== currentUser.user_id) {
          throw new ForbiddenException('Cannot access logs for other salespeople');
        }
        break;
      default:
        throw new ForbiddenException('Unauthorized');
    }

    return this.activityLogsService.getLogs({
      log_type: 'ASSIGNMENT',
      assignment_id: assignmentId
    }, currentUser);
  }

  async transferAssignment(
    assignmentId: number,
    newSalespersonId: number,
    userId: number,
    roleId: number
  ): Promise<Assignment> {
    await this.validateSalesperson(newSalespersonId);

    const currentAssignment = await this.prisma.salesperson_assignments.findUnique({
      where: { assignment_id: assignmentId },
      include: { locations: true }
    });

    if (!currentAssignment) {
      throw new NotFoundException('Assignment not found');
    }

    if (roleId !== 1) {  // Not super-admin
      if (roleId === 2) {  // Manager
        await this.validateManagerPermissions(userId, currentAssignment.location_id);
      } else {
        throw new ForbiddenException('Insufficient permissions');
      }
    }

    // Deactivate current assignment
    await this.prisma.salesperson_assignments.update({
      where: { assignment_id: assignmentId },
      data: { status: false }
    });

    // Create new assignment with same code
    return this.prisma.salesperson_assignments.create({
      data: {
        user_id: newSalespersonId,
        location_id: currentAssignment.location_id,
        status: true,
        assignment_code: currentAssignment.assignment_code  // Use the same code
      },
      include: {
        locations: true,
        users: {
          include: {
            roles: true,
            locations: true
          }
        }
      }
    }) as unknown as Assignment;
  }

  async getLocationSalespeople(locationId: number, roleId: number): Promise<Assignment[]> {
    return this.prisma.salesperson_assignments.findMany({
      where: {
        location_id: locationId,
        status: true
      },
      include: {
        locations: true,
        users: {
          include: {
            roles: true,
            locations: true
          }
        }
      },
      orderBy: {
        assignment_code: 'desc'
      }
    }) as unknown as Assignment[];
  }

  async getSalespersonLocations(salesPersonId: number): Promise<Assignment[]> {
    return this.prisma.salesperson_assignments.findMany({
      where: {
        user_id: salesPersonId,
        status: true
      },
      include: {
        locations: true,
        users: {
          include: {
            roles: true,
            locations: true
          }
        }
      },
      orderBy: {
        assignment_code: 'desc'
      }
    }) as unknown as Assignment[];
  }

  async getAssignmentHistory(locationId?: number, salesPersonId?: number): Promise<Assignment[]> {
    const where: Prisma.salesperson_assignmentsWhereInput = {};
    
    if (locationId) {
      where.location_id = locationId;
    }
    if (salesPersonId) {
      where.user_id = salesPersonId;
    }

    return this.prisma.salesperson_assignments.findMany({
      where,
      include: {
        locations: true,
        users: {
          include: {
            roles: true,
            locations: true
          }
        }
      },
      orderBy: {
        assignment_code: 'desc'
      }
    }) as unknown as Assignment[];
  }

  async getAssignment(assignmentId: number): Promise<Assignment> {
    const assignment = await this.prisma.salesperson_assignments.findUnique({
      where: { assignment_id: assignmentId },
      include: {
        locations: true,
        users: {
          include: {
            roles: true,
            locations: true
          }
        }
      }
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    return assignment as unknown as Assignment;
  }
}