import { Field, ObjectType } from '@nestjs/graphql';
import { CommentsReturnDto } from './comments-return.dto';
import { OnePostReturnDto } from './one-post-return.dto';

@ObjectType()
export class OnlyAllComments {
  @Field(() => CommentsReturnDto)
  ancestors: CommentsReturnDto;

  @Field(() => CommentsReturnDto)
  replies: CommentsReturnDto;
}

@ObjectType()
export class PostAndAllComments extends OnlyAllComments {
  @Field(() => OnePostReturnDto)
  post: OnePostReturnDto;
}
