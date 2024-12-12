import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Location {
  @Field(() => Int)
  location_id: number;

  @Field()
  location_name: string;
}
