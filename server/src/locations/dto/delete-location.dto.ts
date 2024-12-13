import { InputType, Field, Int } from '@nestjs/graphql';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class DeleteLocationDto {
  @Field(() => Int)
  @IsNotEmpty()
  location_id: number;
} 