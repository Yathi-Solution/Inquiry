import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Customer {
  @Field(() => Int)
  customer_id: number;

  @Field()
  name: string;

  @Field({ nullable: true })
  email?: string;

  @Field()
  phone: string;

  @Field()
  visit_date: Date;

  @Field()
  status: string;

  @Field({ nullable: true })
  notes?: string;

  @Field(() => Int)
  location_id: number;

  @Field(() => Int)
  salesperson_id: number;

  @Field()
  created_at: Date;

  @Field()
  updated_at: Date;
} 