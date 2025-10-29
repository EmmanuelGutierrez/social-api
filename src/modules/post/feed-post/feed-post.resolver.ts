import { Args, Query, Resolver } from '@nestjs/graphql';
import { FeedPostService } from './feed-post.service';
import { FeedPost } from './entities/feed-post.entity';
import { FeedPostDataReturnDto } from './dto/feed-post-data-return.dto';
import { FilterFeedPostInput } from './dto/filter.input';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { tokenInfoI } from 'src/common/interfaces/token.interface';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';

@UseGuards(JwtAuthGuard)
@Resolver(() => FeedPost)
export class FeedPostResolver {
  constructor(private readonly feedPostService: FeedPostService) {}

  @Query(() => FeedPostDataReturnDto, { name: 'myFeed' })
  findAll(
    @Args('params') params: FilterFeedPostInput,
    @CurrentUser() tokenData: tokenInfoI,
  ) {
    return this.feedPostService.findAll(params, tokenData.id);
  }
}
