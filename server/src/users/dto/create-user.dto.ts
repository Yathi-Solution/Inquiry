import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsEmail, IsInt, IsOptional } from 'class-validator';

@InputType()
export class CreateUserInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  password: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  role_id?: number; // Optional field

  @Field()
  @IsInt()
  location_id: number; // Required field
}
