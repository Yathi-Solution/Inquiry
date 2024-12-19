import { InputType, Field, Int } from '@nestjs/graphql';
import { IsString, IsOptional, IsEmail, IsNumber } from 'class-validator';

@InputType()
export class UpdateCustomerInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  phone?: string;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  visit_date?: Date;

  @Field(() => String, { nullable: true })
  @IsOptional()
  status?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  notes?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  location_id?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  salesperson_id?: number;
} 