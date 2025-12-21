import { Field, ObjectType } from '@nestjs/graphql';
import { Post } from '../entities/post.entity';

@ObjectType()
export class PostDataReturnDto {
  @Field(() => Number, { nullable: true })
  nextCursor?: number;

  @Field(() => Boolean)
  hasMore: boolean;

  @Field(() => [Post])
  data: Post[];
}
