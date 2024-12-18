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

  async validateUser(email: string, password: string) {
    const user = await this.prisma.users.findUnique({
      where: { email },
      include: { 
        roles: true,
        locations: true
      },
    });

    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { 
      email: user.email, 
      sub: user.user_id, 
      role_id: user.role_id
    };

    await this.activityLogsService.createLog(user.user_id, {
      activity: `User logged in - ${user.email}`,
      log_type: 'AUTH'
    });

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