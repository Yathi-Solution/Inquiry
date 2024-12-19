import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional, IsInt, IsString, IsDate } from 'class-validator';

@InputType()
export class FilterActivityLogInput {
  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  user_id?: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  activity?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  log_type?: string;

  @Field(() => Date, { nullable: true })
  @IsDate()
  @IsOptional()
  start_date?: Date;

  @Field(() => Date, { nullable: true })
  @IsDate()
  @IsOptional()
  end_date?: Date;

  @Field(() => Int, { nullable: true })
  customer_id?: number;

  @Field(() => Int, { nullable: true })
  assignment_id?: number;
} 