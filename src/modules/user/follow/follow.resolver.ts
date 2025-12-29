import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { FollowService } from './follow.service';
import { Follow } from './entities/follow.entity';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Resolver(() => Follow)
export class FollowResolver {
  constructor(private readonly followService: FollowService) {}

  @Query(() => Follow, { name: 'FollowGetFollowing' })
  async getFollowing(
    @Args('userId') userId: string,
    @Args('cursor') cursor: string,
    @Args('limit') limit: number,
  ) {
    return this.followService.getFollowing(userId, cursor, limit);
  }

  @Query(() => Follow, { name: 'FollowGetFollowers' })
  async getFollowers(
    @Args('userId') userId: string,
    @Args('cursor') cursor: string,
    @Args('limit') limit: number,
  ) {
    return this.followService.getFollowers(userId, cursor, limit);
  }

  @Query(() => Int, { name: 'FollowCount' })
  async getFollowCount(@Args('userId') userId: string) {
    return this.followService.getFollowCount(userId);
  }

  @Query(() => Int, { name: 'FollowerCount' })
  async getFollowerCount(@Args('userId') userId: string) {
    return this.followService.getFollowerCount(userId);
  }
}
