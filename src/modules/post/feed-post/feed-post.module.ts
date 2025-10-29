import { Module } from '@nestjs/common';
import { FeedPostService } from './feed-post.service';
import { FeedPostResolver } from './feed-post.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { FeedPost, FeedPostSchema } from './entities/feed-post.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: FeedPost.name,
        schema: FeedPostSchema,
      },
    ]),
  ],
  exports: [FeedPostService],
  providers: [FeedPostResolver, FeedPostService],
})
export class FeedPostModule {}
