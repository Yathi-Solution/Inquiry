import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class LocationInput {
  @Field(() => Int)
  location_id: number;

  @Field()
  location_name: string;
} 