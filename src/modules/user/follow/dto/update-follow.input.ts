import { FollowUserInput } from './follow.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateFollowInput extends PartialType(FollowUserInput) {
  @Field(() => Int)
  id: number;
}
