import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsEmail, IsString, IsDate, IsOptional } from 'class-validator';

@InputType()
export class CreateCustomerInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  name: string;

  @Field()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  phone: string;

  @Field()
  @IsNotEmpty()
  location_id: number;

  @Field()
  @IsNotEmpty()
  @IsDate()
  visit_date: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}