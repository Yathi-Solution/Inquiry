import { InputType, Field, PartialType } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsEmail, IsOptional } from 'class-validator';
import { CreateUserInput } from './create-user.dto';

@InputType()
export class UpdateUserInput extends PartialType(CreateUserInput) {
  @Field()
  user_id: number; // This field is required for the update operation

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Field({ nullable: true })
  @IsEmail()
  @IsOptional()
  email?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  password?: string;

  @Field({ nullable: true })
  @IsOptional()
  role_id?: number;

  @Field({ nullable: true })
  @IsOptional()
  location_id?: number;
}