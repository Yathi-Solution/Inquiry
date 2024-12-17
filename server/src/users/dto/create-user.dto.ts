import { IsString, IsEmail, IsInt, IsNotEmpty } from 'class-validator';
import { InputType, Field, Int } from '@nestjs/graphql';

@InputType()
export class CreateUserInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  name: string; // User's name

  @Field()
  @IsEmail()
  @IsNotEmpty()
  email: string; // User's email

  @Field()
  @IsString()
  @IsNotEmpty()
  password: string; // User's password

  @Field(() => Int)
  @IsInt()
  @IsNotEmpty()
  role_id: number; // Role ID (should be required)

  @Field(() => Int)
  @IsInt()
  @IsNotEmpty()
  location_id: number; // Location ID (should be required)
}