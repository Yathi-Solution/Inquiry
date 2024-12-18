import { InputType, Field } from '@nestjs/graphql';
import { IsString, MinLength } from 'class-validator';

@InputType()
export class ChangePasswordInput {
  @Field()
  @IsString()
  oldPassword: string;

  @Field()
  @IsString()
  @MinLength(6)
  newPassword: string;
} 