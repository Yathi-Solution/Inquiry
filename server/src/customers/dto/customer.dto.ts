// src/customers/dto/customer.dto.ts
import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class CustomerDto {
  @Field(() => Int)
  customer_id: number;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  phone: string;

  @Field(() => Int)
  location_id: number;

  @Field(() => Int)
  salesperson_id: number;

  @Field()
  visit_date: Date;

  @Field()
  status: string;

  @Field({ nullable: true })
  notes?: string;

  @Field()
  created_at: Date;

  @Field()
  updated_at: Date;
}