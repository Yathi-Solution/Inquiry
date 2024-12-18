import { InputType, Field, Int } from '@nestjs/graphql';
import { IsInt, IsOptional } from 'class-validator';
import { SortOrder } from '../../common/types/sort-order.type';

@InputType()
export class FilterAssignmentInput {
  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  location_id?: number;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  user_id?: number;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  status?: boolean;

  @Field(() => String, { nullable: true })
  @IsOptional()
  sortBy?: SortOrder;
} 