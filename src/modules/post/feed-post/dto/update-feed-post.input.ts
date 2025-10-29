import { CreateFeedPostInput } from './create-feed-post.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateFeedPostInput extends PartialType(CreateFeedPostInput) {
  @Field(() => Int)
  id: number;
}
