import { ReactionInput } from './reaction.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateReactionInput extends PartialType(ReactionInput) {
  @Field(() => Int)
  id: number;
}
