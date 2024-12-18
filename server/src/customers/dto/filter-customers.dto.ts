// src/customers/dto/filter-customers.dto.ts
import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional, IsString, IsDate } from 'class-validator';

@InputType()
export class FilterCustomersInput {
  @Field(() => Int, { nullable: true })
  salesperson_id?: number;

  @Field(() => Int, { nullable: true })
  location_id?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  status?: string;

  @Field({ nullable: true })
  @IsOptional()
  visitDateFrom?: Date;

  @Field({ nullable: true })
  @IsOptional()
  visitDateTo?: Date;

  @Field({ nullable: true })
  @IsOptional()
  createdAtFrom?: Date;

  @Field({ nullable: true })
  @IsOptional()
  createdAtTo?: Date;

  @Field({ nullable: true })
  @IsOptional()
  sortBy?: 'name' | 'visit_date' | 'created_at';

  @Field({ nullable: true })
  @IsOptional()
  sortOrder?: 'asc' | 'desc';
}