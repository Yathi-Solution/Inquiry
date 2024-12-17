import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class UserInput {
  @Field(() => Int)
  user_id: number;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field(() => Int)
  role_id: number;

  @Field(() => Int)
  location_id: number;
} 