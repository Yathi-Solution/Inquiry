import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class FilterUserInput {
  @Field(() => Int, { nullable: true })
  location_id?: number;

  @Field(() => Int, { nullable: true })
  role_id?: number;
}