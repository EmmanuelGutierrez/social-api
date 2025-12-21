import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { FollowService } from './follow.service';
import { Follow } from './entities/follow.entity';
import { UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { tokenInfoI } from 'src/common/interfaces/token.interface';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Resolver(() => Follow)
export class FollowResolver {
  constructor(private readonly followService: FollowService) {}

  // @Mutation(() => Follow)
  // async followUser(
  //   @Args('userToFollowId') userToFollowId: string,
  //   @CurrentUser() tokenData: tokenInfoI,
  // ) {
  //   return this.followService.followUser({
  //     follower: tokenData.id,
  //     following: userToFollowId,
  //   });
  // }

  // @Mutation(() => Follow)
  // async unfollowUser(
  //   @Args('userToUnfollow') userToUnfollow: string,
  //   @CurrentUser() tokenData: tokenInfoI,
  // ) {
  //   return this.followService.unfollowUser({
  //     follower: tokenData.id,
  //     following: userToUnfollow,
  //   });
  // }

  @Query(() => Follow)
  async getFollowing(
    @Args('userId') userId: string,
    @Args('cursor') cursor: string,
    @Args('limit') limit: number,
  ) {
    return this.followService.getFollowing(userId, cursor, limit);
  }

  @Query(() => Follow)
  async getFollowers(
    @Args('userId') userId: string,
    @Args('cursor') cursor: string,
    @Args('limit') limit: number,
  ) {
    return this.followService.getFollowers(userId, cursor, limit);
  }

  @Query(() => Int)
  async getFollowCount(@Args('userId') userId: string) {
    return this.followService.getFollowCount(userId);
  }

  @Query(() => Int)
  async getFollowerCount(@Args('userId') userId: string) {
    return this.followService.getFollowerCount(userId);
  }
}
