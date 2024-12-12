import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Role {
  @Field(() => Int)
  role_id: number;

  @Field()
  role_name: string;
}
