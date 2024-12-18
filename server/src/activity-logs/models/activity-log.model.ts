import { ObjectType, Field, Int } from '@nestjs/graphql';
import { User } from '../../users/models/user.model';

@ObjectType()
export class ActivityLog {
  @Field(() => Int)
  activity_id: number;

  @Field(() => Int)
  user_id: number;

  @Field()
  activity: string;

  @Field()
  log_type: string;

  @Field(() => Date)
  created_at: Date;

  @Field(() => User)
  users: User;
} 