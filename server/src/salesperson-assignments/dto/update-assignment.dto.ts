import { InputType, Field, Int } from '@nestjs/graphql';
import { IsInt, IsBoolean, IsNotEmpty } from 'class-validator';

@InputType()
export class UpdateAssignmentStatusInput {
  @Field(() => Int)
  @IsInt()
  @IsNotEmpty()
  assignment_id: number;

  @Field()
  @IsBoolean()
  @IsNotEmpty()
  status: boolean;
}