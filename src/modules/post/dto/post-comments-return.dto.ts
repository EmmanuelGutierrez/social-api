import { Field, ObjectType } from '@nestjs/graphql';
import { OnePostReturnDto } from './one-post-return.dto';
import { CommentsReturnDto } from './comments-return.dto';

@ObjectType()
export class PostCommentsReturnDto {
  @Field(() => OnePostReturnDto)
  readonly post: OnePostReturnDto;

  @Field(() => CommentsReturnDto)
  readonly ancestors: CommentsReturnDto;

  @Field(() => CommentsReturnDto)
  readonly replies: CommentsReturnDto;
}
