import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SubDataReturnDto {
  @Field(() => String)
  postId: string;
  @Field(() => String)
  authorId: string;
  @Field(() => String)
  authorUsername: string;
}
