import { ObjectType, Field, Int } from '@nestjs/graphql';
import { User } from './user.model';

@ObjectType()
export class ManagerStatistics {
  @Field(() => Int)
  totalSalespersons: number;

  @Field(() => Int)
  totalCustomers: number;

  @Field(() => Int)
  todayAppointments: number;
}

@ObjectType()
export class ManagerProfile extends User {
  @Field(() => ManagerStatistics)
  statistics: ManagerStatistics;
}