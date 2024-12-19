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
    try {
      const user = await this.prisma.users.findUnique({
        where: { email },
        include: { roles: true, locations: true }
      });

      // User doesn't exist
      if (!user) {
        return {
          success: false,
          message: "User does not exist"
        };
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        await this.activityLogsService.createLog(user.user_id, {
          activity: `Failed login attempt - ${user.email} (Invalid password)`,
          log_type: 'AUTH'
        });
        
        return {
          success: false,
          message: "Invalid credentials"
        };
      }

      // Successful login
      await this.activityLogsService.createLog(user.user_id, {
        activity: `Successful login - ${user.email} (${user.roles.role_name})`,
        log_type: 'AUTH'
      });

      return {
        success: true,
        user
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: "An error occurred during login"
      };
    }
  }

  async login(user: any) {
    if (!user.success) {
      throw new UnauthorizedException(user.message);
    }

    const payload = { 
      email: user.user.email, 
      sub: user.user.user_id, 
      role_id: user.user.role_id, 
      location_id: user.user.location_id 
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: user.user,
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