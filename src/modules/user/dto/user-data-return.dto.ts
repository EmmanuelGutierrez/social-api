import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../entities/user.entity';

@ObjectType()
export class UserDataReturnDto {
  @Field(() => User)
  user: User;

  @Field(() => Boolean)
  isFollowing: boolean;
}
