import { InputType, Field } from '@nestjs/graphql';
import { Types } from 'mongoose';

@InputType()
export class CreateFeedPostInput {
  @Field(() => Types.ObjectId)
  userId: string;

  @Field(() => Types.ObjectId)
  postId: string;
}
