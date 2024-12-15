// src/customers/models/customer.model.ts
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from '../../users/models/user.model';
import { Location } from '../../locations/models/location.model';

@ObjectType()
export class Customer {
  @Field(() => ID)
  customer_id: number;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  phone: string;

  @Field()
  location_id: number;

  @Field()
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

  @Field(() => Location)
  location?: Location;

  @Field(() => User)
  salesperson?: User;
}





