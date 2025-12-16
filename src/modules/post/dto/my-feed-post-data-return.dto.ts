import { Field, ObjectType } from '@nestjs/graphql';
import { OnePostReturnDto } from './one-post-return.dto';
import { CommonReturn } from 'src/common/dto/common-return.dto';
@ObjectType()
export class MyFeedPostDataReturnDto
  implements CommonReturn<OnePostReturnDto, number>
{
  // @Field(() => Number)
  // page: number;

  @Field(() => Number, { nullable: true })
  nextCursor?: number;

  // @Field(() => Number)
  // inThisPage: number;

  // @Field(() => Number)
  // inDb: number;

  @Field(() => Boolean)
  hasMore: boolean;

  @Field(() => [OnePostReturnDto])
  data: OnePostReturnDto[];
}
