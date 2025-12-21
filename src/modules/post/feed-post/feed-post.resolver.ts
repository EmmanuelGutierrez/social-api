import { Resolver } from '@nestjs/graphql';
import { FeedPostService } from './feed-post.service';
import { FeedPost } from './entities/feed-post.entity';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';

@UseGuards(JwtAuthGuard)
@Resolver(() => FeedPost)
export class FeedPostResolver {
  constructor(private readonly feedPostService: FeedPostService) {}
}
