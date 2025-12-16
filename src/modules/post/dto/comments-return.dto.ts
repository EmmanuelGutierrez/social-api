import { CommonReturn } from 'src/common/dto/common-return.dto';
import { Field, ObjectType } from '@nestjs/graphql';
import { OnePostReturnDto } from './one-post-return.dto';

@ObjectType()
export class CommentsReturnDto
  implements CommonReturn<OnePostReturnDto, string>
{
  @Field(() => Boolean)
  hasMore: boolean;

  @Field(() => [OnePostReturnDto])
  data: OnePostReturnDto[];

  @Field(() => String, { nullable: true })
  nextCursor: string;
}
