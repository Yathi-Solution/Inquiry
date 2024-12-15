// src/customers/dto/update-customer.input.ts
import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsEmail, IsString, IsDate } from 'class-validator';

@InputType()
export class UpdateCustomerInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  visit_date?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  status?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}