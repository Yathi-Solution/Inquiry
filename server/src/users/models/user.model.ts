import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Role } from '../../roles/models/role.model'; // Ensure this import is correct
import { Location } from '../../locations/models/location.model'; // Ensure this import is correct

@ObjectType()
export class User {
  @Field(() => Int)
  user_id: number;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field(() => Role) // Role is now required
  roles: Role;

  @Field(() => Location) // Location is now required
  locations: Location;

  @Field(() => Int) // role_id is required
  role_id: number;

  @Field(() => Int) // location_id is required
  location_id: number;
}