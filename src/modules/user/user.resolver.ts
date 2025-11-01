import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { tokenInfoI } from 'src/common/interfaces/token.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';

@UseGuards(JwtAuthGuard)
@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  // @Mutation(() => User)
  // createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
  //   return this.userService.create(createUserInput);
  // }

  // @Query(() => [User], { name: 'user' })
  // findAll() {
  //   return this.userService.findAll();
  // }

  // @Query(() => User, { name: 'user' })
  // findOne(@Args('id', { type: () => Int }) id: number) {
  //   return this.userService.findOne(id);
  // }

  // @Mutation(() => User)
  // updateUser(@Args('updateUserInput') updateUserInput: UpdateUserInput) {
  //   return this.userService.update(updateUserInput.id, updateUserInput);
  // }

  // @Mutation(() => User)
  // removeUser(@Args('id', { type: () => Int }) id: number) {
  //   return this.userService.remove(id);
  // }

  @Mutation(() => Boolean, { name: 'followUser' })
  followUser(
    @Args('userToFollowId') userToFollowId: string,
    @CurrentUser() tokenData: tokenInfoI,
  ) {
    return this.userService.followUser(tokenData.id, userToFollowId);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => User, { name: 'meQuery' })
  async meQuery(@CurrentUser() tokenData: tokenInfoI) {
    const user = await this.userService.findById(tokenData.id);
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => String, { name: 'test' })
  test() {
    return ' TEST';
  }
}
