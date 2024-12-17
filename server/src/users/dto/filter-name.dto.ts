
import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class GetUsersByNameInput {
  @Field({ nullable: true })
  name?: string;

  @Field(() => String, { nullable: true })
  sortByName?: 'asc' | 'desc'; // Sort direction (ascending or descending)
}