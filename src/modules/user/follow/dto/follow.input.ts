import { InputType, Field } from '@nestjs/graphql';
import { IsMongoId, IsNotEmpty } from 'class-validator';
import { Types } from 'mongoose';

@InputType()
export class FollowUserInput {
  @IsMongoId()
  @IsNotEmpty()
  @Field(() => String)
  follower: Types.ObjectId;

  @IsMongoId()
  @IsNotEmpty()
  @Field(() => String)
  following: Types.ObjectId;
}
