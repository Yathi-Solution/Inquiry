import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty } from 'class-validator';

@InputType()
export class GetLocationInput {
  @Field(() => Int)
  @IsInt()
  @IsNotEmpty()
  location_id: number;
} 