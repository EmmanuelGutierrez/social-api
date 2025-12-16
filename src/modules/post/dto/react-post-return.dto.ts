import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class RactPostReturnDto {
  @Field(() => Boolean)
  ignored: boolean;

  @Field(() => Number)
  likedCount: number;
}
