// src/customers/dto/filter-customers.dto.ts
import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class FilterCustomersInput {
  @Field(() => Int, { nullable: true })
  salesperson_id?: number;

  @Field(() => Int, { nullable: true })
  location_id?: number;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  status?: string;

  @Field({ nullable: true })
  sortBy?: 'name' | 'visit_date' | 'created_at'; // Sorting options
}