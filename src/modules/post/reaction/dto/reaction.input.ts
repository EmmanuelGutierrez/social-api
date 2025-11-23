import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class ReactionInput {
  @Field(() => String)
  userId: string;

  @Field(() => String)
  postId: string;
}
