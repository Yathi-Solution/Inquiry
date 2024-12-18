import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ActivityLogsService } from './activity-logs.service';
import { ActivityLog } from './models/activity-log.model';
import { CreateActivityLogInput } from './dto/create-activity-log.dto';
import { FilterActivityLogInput } from './dto/filter-activity-log.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Resolver(() => ActivityLog)
@UseGuards(JwtAuthGuard)
export class ActivityLogsResolver {
  constructor(private readonly activityLogsService: ActivityLogsService) {}

  @Mutation(() => ActivityLog)
  async createActivityLog(
    @Args('input') input: CreateActivityLogInput,
    @CurrentUser() user: any
  ) {
    return this.activityLogsService.createLog(user.user_id, input);
  }

  @Query(() => [ActivityLog])
  async getActivityLogs(
    @CurrentUser() user: any,
    @Args('filter', { nullable: true }) filter?: FilterActivityLogInput
  ) {
    if (user.role_id !== 1) {
      filter = filter || {};
      filter.user_id = user.user_id;
    }
    return this.activityLogsService.getLogs(filter, user);
  }

  @Query(() => ActivityLog)
  async getActivityLog(
    @Args('activity_id', { type: () => Int }) activity_id: number
  ) {
    return this.activityLogsService.getLogById(activity_id);
  }

  @Query(() => [ActivityLog])
  async getUserLogs(
    @Args('user_id', { type: () => Int }) user_id: number,
    @CurrentUser() user: any
  ) {
    if (user.role_id !== 1 && user.user_id !== user_id) {
      throw new Error('Unauthorized to view these logs');
    }
    return this.activityLogsService.getUserLogs(user_id);
  }
} 