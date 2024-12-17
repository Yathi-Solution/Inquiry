// src/users/dto/user.dto.ts
import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class UserDto {
  @Field(type => Int)
  user_id: number;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  password: string;

  @Field()
  role_id: number;

  @Field()
  location_id?: number;

  @Field(type => String)
  role_name: string;  

  @Field(type => String, { nullable: true })
  location_name?: string;  
}