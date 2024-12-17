// src/customers/dto/create-customer.dto.ts
import { InputType, Field, Int } from '@nestjs/graphql';
import { IsString, IsEmail, IsInt, IsNotEmpty } from 'class-validator';

@InputType()
export class CreateCustomerInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  phone: string;

  @Field()
  @IsNotEmpty()
  visit_date: Date;

  @Field({ nullable: true })
  @IsString()
  status?: string;

  @Field({ nullable: true })
  @IsString()
  notes?: string;

  @Field(() => Int)
  @IsInt()
  @IsNotEmpty()
  location_id: number;

  @Field(() => Int)
  @IsInt()
  @IsNotEmpty()
  salesperson_id: number;
}