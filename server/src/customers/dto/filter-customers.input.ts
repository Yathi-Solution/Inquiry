// src/customers/dto/filter-customers.input.ts
import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsString, IsDate } from 'class-validator';

@InputType()
export class FilterCustomersInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field({ nullable: true })
  @IsOptional()
  location_id?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  status?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  from_date?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  to_date?: Date;
}