import { Field, ObjectType } from '@nestjs/graphql';
import { Post } from '../entities/post.entity';

@ObjectType()
export class OnePostReturnDto {
  @Field(() => Post)
  post: Post;

  @Field(() => Boolean)
  iLiked: boolean;

  @Field(() => Number)
  likeCount: number;

  @Field(() => Number)
  replyCount: number;
}
