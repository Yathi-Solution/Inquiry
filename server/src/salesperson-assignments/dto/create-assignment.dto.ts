import { InputType, Field, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty } from 'class-validator';

@InputType()
export class CreateAssignmentInput {
  @Field(() => Int)
  @IsInt()
  @IsNotEmpty()
  user_id: number;

  @Field(() => Int)
  @IsInt()
  @IsNotEmpty()
  location_id: number;
}
