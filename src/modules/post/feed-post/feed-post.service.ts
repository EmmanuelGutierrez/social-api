import { Injectable } from '@nestjs/common';
import { CreateFeedPostInput } from './dto/create-feed-post.input';
// import { UpdateFeedPostInput } from './dto/update-feed-post.input';
import { InjectModel } from '@nestjs/mongoose';
import { FeedPost } from './entities/feed-post.entity';
import { Model, RootFilterQuery } from 'mongoose';
import { Post } from '../entities/post.entity';
import { FilterFeedPostInput } from './dto/filter.input';
import { User } from 'src/modules/user/entities/user.entity';
import { FeedPostDataReturnDto } from './dto/feed-post-data-return.dto';
import { File } from 'src/modules/file/entities/file.entity';

@Injectable()
export class FeedPostService {
  constructor(
    @InjectModel(FeedPost.name)
    private feedPostModel: Model<FeedPost>,
  ) {}

  async create(data: CreateFeedPostInput) {
    const feedPost = await this.feedPostModel.create(data);
    return feedPost;
  }

  // async findAll(userId: string) {
  //   const feedPosts = await this.feedPostModel
  //     .find({ userId })
  //     .sort({ createdAt: -1 })
  //     .populate([{ path: 'postId', model: Post.name }]);

  //   return feedPosts;
  // }

  async findAll(
    params: FilterFeedPostInput,
    userId: string,
  ): Promise<FeedPostDataReturnDto> {
    const { limit = 10, cursorDate = new Date().getTime() } = params;
    const query: RootFilterQuery<FeedPost> = {
      userId: userId,
      createdAt: { $lt: cursorDate },
    };
    const posts = await this.feedPostModel
      .find(query)
      .sort({ createdAt: -1 })
      // .skip((page - 1) * limit)
      .limit(limit + 1)
      .populate([
        {
          path: 'postId',
          model: Post.name,
          populate: {
            path: 'authorId',
            model: User.name,
            populate: { path: 'profileImg', model: File.name },
          },
        },
        ,
      ]);

    const total = await this.feedPostModel.countDocuments({ userId });
    const hasMore = posts.length > limit;
    const data = hasMore ? posts.slice(0, limit) : posts;
    const nextCursor = hasMore ? posts[posts.length - 1].createdAt + 1 : null;
    return {
      inThisPage: posts.length,
      hasMore,
      inDb: total,
      nextCursor,
      data,
    };
  }
}
