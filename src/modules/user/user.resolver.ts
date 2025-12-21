import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { tokenInfoI } from 'src/common/interfaces/token.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { UserDataReturnDto } from './dto/user-data-return.dto';

@UseGuards(JwtAuthGuard)
@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Query(() => User, { name: 'meQuery' })
  async meQuery(@CurrentUser() tokenData: tokenInfoI) {
    const user = await this.userService.findById(tokenData.id);
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  async followUser(
    @Args('userToFollowId') userToFollowId: string,
    @CurrentUser() tokenData: tokenInfoI,
  ) {
    return this.userService.followUser(tokenData.id, userToFollowId);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => UserDataReturnDto, { name: 'userByUsername' })
  async userByUsername(
    @Args('username') username: string,
    @CurrentUser() tokenData: tokenInfoI,
  ) {
    return this.userService.findByUsername(username, tokenData.id);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => [User], { name: 'suggestedUsers' })
  async suggestedUsers(@CurrentUser() tokenData: tokenInfoI) {
    return this.userService.getRandomSuggestedUsers(tokenData.id);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Boolean)
  async unfollowUser(
    @Args('userToUnfollowId') userToUnfollowId: string,
    @CurrentUser() tokenData: tokenInfoI,
  ) {
    return this.userService.unfollowUser(tokenData.id, userToUnfollowId);
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => String, { name: 'test' })
  test() {
    return ' TEST';
  }
}
