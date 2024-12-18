// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma-services/prisma.service';
import * as bcrypt from 'bcrypt';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private activityLogsService: ActivityLogsService
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.users.findUnique({
      where: { email },
      include: { roles: true, locations: true }
    });

    if (user && await bcrypt.compare(password, user.password)) {
      await this.activityLogsService.createLog(user.user_id, {
        activity: `Successful login - ${user.email} (${user.roles.role_name})`,
        log_type: 'AUTH'
      });
      return user;
    }

    // Log failed attempt
    if (user) {
      await this.activityLogsService.createLog(user.user_id, {
        activity: `Failed login attempt - ${user.email} (Invalid password)`,
        log_type: 'AUTH'
      });
    } else {
      // Generic log for non-existent user
      await this.activityLogsService.createLog(0, {
        activity: `Failed login attempt - ${email} (User not found)`,
        log_type: 'AUTH'
      });
    }
    
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.user_id };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async logout(userId: number) {
    const user = await this.prisma.users.findUnique({
      where: { user_id: userId }
    });

    await this.activityLogsService.createLog(userId, {
      activity: `User logged out - ${user.email}`,
      log_type: 'AUTH'
    });

    return true;
  }
}