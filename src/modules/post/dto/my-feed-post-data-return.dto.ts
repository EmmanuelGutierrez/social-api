import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Post } from '../entities/post.entity';

@ObjectType()
class PostDataDto {
  @Field(() => Post)
  post: Post

  @Field(()=>Boolean)
  iLiked: boolean;
}

@ObjectType()
export class MyFeedPostDataReturnDto {
  // @Field(() => Number)
  // page: number;

  @Field(() => Number, { nullable: true })
  nextCursor?: number;

  @Field(() => Number)
  inThisPage: number;

  @Field(() => Number)
  inDb: number;

  @Field(() => Boolean)
  hasMore: boolean;

  @Field(() => [PostDataDto])
  data: PostDataDto[];
}
