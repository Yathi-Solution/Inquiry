import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class CreateActivityLogInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  activity: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  log_type: string;
} 