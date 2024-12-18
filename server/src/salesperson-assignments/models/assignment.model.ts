import { ObjectType, Field, Int } from '@nestjs/graphql';
import { User } from '../../users/models/user.model';
import { Location } from '../../locations/models/location.model';

@ObjectType()
export class Assignment {
  @Field(() => Int)
  assignment_id: number;

  @Field()
  assignment_code: string;

  @Field(() => Int)
  user_id: number;

  @Field(() => Int)
  location_id: number;

  @Field()
  status: boolean;

  @Field(() => User)
  users: User;

  @Field(() => Location)
  locations: Location;
}