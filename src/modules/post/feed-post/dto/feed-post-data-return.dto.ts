import { Field, ObjectType } from '@nestjs/graphql';
import { FeedPost } from '../entities/feed-post.entity';

@ObjectType()
export class FeedPostDataReturnDto {
  @Field(() => Number)
  page: number;

  @Field(() => Number)
  inThisPage: number;

  @Field(() => Number)
  total: number;

  @Field(() => [FeedPost])
  data: FeedPost[];
}
