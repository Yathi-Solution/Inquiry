import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SalespersonAssignmentsService } from './salesperson-assignments.service';
import { Assignment } from './models/assignment.model';
import { CreateAssignmentInput } from './dto/create-assignment.dto';
import { UpdateAssignmentStatusInput } from './dto/update-assignment.dto';
import { FilterAssignmentInput } from './dto/filter-assignment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Resolver(() => Assignment)
@UseGuards(JwtAuthGuard)
export class SalespersonAssignmentsResolver {
  constructor(private readonly salespersonAssignmentsService: SalespersonAssignmentsService) {}

  @UseGuards(RolesGuard)
  @Roles(1, 2)  // Super Admin and Manager only
  @Mutation(() => Assignment)
  async createAssignment(
    @Args('input') input: CreateAssignmentInput,
    @CurrentUser() user: any
  ) {
    return this.salespersonAssignmentsService.createAssignment(
      input,
      user.user_id,
      user.role_id
    );
  }

  @UseGuards(RolesGuard)
  @Roles(1, 2)
  @Mutation(() => Assignment)
  async updateAssignmentStatus(
    @Args('input') input: UpdateAssignmentStatusInput,
    @CurrentUser() user: any
  ) {
    return this.salespersonAssignmentsService.updateAssignmentStatus(
      input,
      user.user_id,
      user.role_id
    );
  }

  @UseGuards(RolesGuard)
  @Roles(1, 2)
  @Mutation(() => Assignment)
  async transferAssignment(
    @Args('assignmentId', { type: () => Int }) assignmentId: number,
    @Args('newSalespersonId', { type: () => Int }) newSalespersonId: number,
    @CurrentUser() user: any
  ) {
    return this.salespersonAssignmentsService.transferAssignment(
      assignmentId,
      newSalespersonId,
      user.user_id,
      user.role_id
    );
  }

  @Query(() => [Assignment])
  async getLocationSalespeople(
    @Args('locationId', { type: () => Int }) locationId: number,
    @CurrentUser() user: any
  ) {
    return this.salespersonAssignmentsService.getLocationSalespeople(
      locationId,
      user.role_id
    );
  }

  @Query(() => [Assignment])
  async getSalespersonLocations(
    @Args('salesPersonId', { type: () => Int }) salesPersonId: number
  ) {
    return this.salespersonAssignmentsService.getSalespersonLocations(salesPersonId);
  }

  @Query(() => [Assignment])
  async getAssignmentHistory(
    @Args('locationId', { type: () => Int, nullable: true }) locationId?: number,
    @Args('salesPersonId', { type: () => Int, nullable: true }) salesPersonId?: number
  ) {
    return this.salespersonAssignmentsService.getAssignmentHistory(locationId, salesPersonId);
  }

  @Query(() => Assignment)
  async getAssignment(
    @Args('assignmentId', { type: () => Int }) assignmentId: number
  ) {
    return this.salespersonAssignmentsService.getAssignment(assignmentId);
  }
}