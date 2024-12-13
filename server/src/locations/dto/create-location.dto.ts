import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class CreateLocationDto {
  @Field()
  @IsNotEmpty()
  @IsString()
  location_name: string;
} 