import { Injectable } from '@nestjs/common';
import { CreateFeedPostInput } from './dto/create-feed-post.input';
// import { UpdateFeedPostInput } from './dto/update-feed-post.input';
import { InjectModel } from '@nestjs/mongoose';
import { FeedPost } from './entities/feed-post.entity';
import { Model, RootFilterQuery } from 'mongoose';
import { Post } from '../entities/post.entity';
import { FilterFeedPostInput } from './dto/filter.input';

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

  async findAll(params: FilterFeedPostInput, userId: string) {
    const { limit = 10, cursorDate = Math.floor(new Date().getTime() / 1000) } =
      params;
    const query: RootFilterQuery<FeedPost> = {
      userId: userId,
      createdAt: { $lt: cursorDate },
    };
    const posts = await this.feedPostModel
      .find(query)
      .sort({ createdAt: -1 })
      // .skip((page - 1) * limit)
      .limit(limit)
      .populate([{ path: 'postId', model: Post.name }]);

    const total = await this.feedPostModel.countDocuments();
    return { inThisPage: posts.length, total, data: posts };
  }
}
