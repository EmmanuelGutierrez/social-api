import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { Post, PostSchema } from './entities/post.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { PostResolver } from './post.resolver';
import { FileModule } from '../file/file.module';
import { RedisPubSubModule } from '../redis-pub-sub/redis-pub-sub.module';
import { FeedPostModule } from './feed-post/feed-post.module';
import { BullModule } from '@nestjs/bullmq';
import { config, configType } from 'src/common/config/config';
import { feedPostQueueName } from 'src/common/constants/bull/feedPost';
import PostProcessor from './post.processor';
import { UserModule } from '../user/user.module';
import { ReactionModule } from './reaction/reaction.module';

@Module({
  imports: [
    BullModule.registerQueueAsync({
      name: feedPostQueueName,
      inject: [config.KEY],
      useFactory: (configService: configType) => {
        return {
          connection: {
            host: configService.redis.host,
            port: configService.redis.port,
            password: configService.redis.password,
            db: configService.redis.db,
          },
          defaultJobOptions: {
            priority: 1,
            attempts: 3,
            backoff: { type: 'exponential', delay: 5000 },
            removeOnComplete: true,
            removeOnFail: true,
          },
        };
      },
    }),
    MongooseModule.forFeature([
      {
        name: Post.name,
        schema: PostSchema,
      },
    ]),
    FileModule,
    RedisPubSubModule,
    FeedPostModule,
    UserModule,
    ReactionModule,
    /* MessageModule, */
  ],
  providers: [PostService, PostResolver, PostProcessor],
  exports: [PostService],
  // controllers: [PostController],
})
export class PostModule {}
