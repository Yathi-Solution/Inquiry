import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Role } from '../../roles/models/role.model'; // Assuming you have a Role model defined
import { Location } from '../../locations/models/location.model'; // Assuming you have a Location model defined
import { Customer } from '../../customers/models/customer.model';

@ObjectType()
export class User {
  @Field(() => Int)
  user_id: number;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field(() => Role, { nullable: true }) // Role is nullable now since it's optional
  role?: Role;

  @Field(() => Location) // Location is required because it's now non-nullable
  location: Location;

  @Field(() => Int, { nullable: true })
  role_id?: number; // role_id is now optional

  @Field(() => Int)
  location_id: number; // location_id is now non-nullable
}
