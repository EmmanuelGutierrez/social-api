import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { feedPostQueueName } from 'src/common/constants/bull/feedPost';
import { RedisPubSubService } from '../redis-pub-sub/redis-pub-sub.service';
import { FeedPostService } from './feed-post/feed-post.service';
import { SUB_NEW_POSTS } from 'src/common/constants/redis/sub-new-posts';

@Processor(feedPostQueueName, { concurrency: 5 })
class PostProcessor extends WorkerHost {
  constructor(
    private redisPubSub: RedisPubSubService,
    private feedPostService: FeedPostService,
  ) {
    super();
  }
  async process(job: Job, token?: string): Promise<any> {
    console.log(job, token);
    switch (job.name) {
      case 'addToFeed':
        const {
          data,
        }: {
          data: {
            postId: string;
            authorId: string;
            authorUsername: string;
            followerId: string;
          };
        } = job;
        await this.redisPubSub.publish(`SUB_NEW_POSTS-${data.followerId}`, {
          [SUB_NEW_POSTS]: {
            postId: data.postId,
            authorId: data.authorId,
            authorUsername: data.authorUsername,
          },
        });
        await this.feedPostService.create({
          postId: data.postId,
          userId: data.followerId,
        });
        break;

      default:
        console.log('default');
        break;
    }
  }
}

export default PostProcessor;
