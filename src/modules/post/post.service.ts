import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostInput } from './dto/create-post.input';
import { UpdatePostInput } from './dto/update-post.input';
import { Post } from './entities/post.entity';
import { FilterQuery, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { FilterInput } from './dto/filter.input';
import { User } from '../user/entities/user.entity';
// import { postTypes } from 'src/common/enum/postTypes.enum';
import { FileService } from '../file/file.service';
import { RedisPubSubService } from '../redis-pub-sub/redis-pub-sub.service';
import { SUB_NEW_POSTS } from 'src/common/constants/redis/sub-new-posts';
//import { MessageService } from './message/message.service';
import { FileUpload } from 'graphql-upload/processRequest.mjs';
import { FeedPostService } from './feed-post/feed-post.service';
import { InjectQueue } from '@nestjs/bullmq';
import { feedPostQueueName } from 'src/common/constants/bull/feedPost';
import { Queue } from 'bullmq';
import { UserService } from '../user/user.service';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name)
    private postModel: Model<Post>,
    private fileService: FileService,
    private redisPubSub: RedisPubSubService,
    private feedPostService: FeedPostService,
    private userService: UserService,
    @InjectQueue(feedPostQueueName) private postQueue: Queue,
  ) {}
  async create(data: CreatePostInput, userId: string) {
    const post = await this.postModel.create({
      ...data,
      authorId: userId,
    });
    await this.redisPubSub.publish(SUB_NEW_POSTS, {
      [SUB_NEW_POSTS]: post,
    });
    return post;
  }

  async createWithFiles(
    data: CreatePostInput,
    userId: string,
    filesData: Express.Multer.File[],
  ) {
    const post = await this.postModel.create({
      ...data,
      authorId: userId,
    });

    const files = await this.fileService.createMany(
      filesData,
      post._id,
      `posts/files/${userId}`,
    );
    console.log(files);
    return post;
  }

  async createWithFilesGraphQL(
    data: CreatePostInput,
    userId: string,
    filesData?: Promise<FileUpload>[],
  ) {
    const user = await this.userService.findById(userId);
    const post = await this.postModel.create({
      ...data,
      authorId: userId,
    });

    if (filesData) {
      await this.fileService.createManyGraphql(
        filesData,
        post._id,
        `posts/files/${userId}`,
      );
    }
    // await this.redisPubSub.publish(SUB_NEW_POSTS, {
    //   [SUB_NEW_POSTS]: post,
    // });
    for (const follower of user.followers) {
      await this.postQueue.add('addToFeed', {
        postId: post._id,
        followerId: follower.user._id,
        authorId: userId,
        authorUsername: user.username,
      });
    }
    return post;
  }

  async findAll(params: FilterInput) {
    const { limit = 10, page = 1 } = params;
    const posts = await this.postModel
      .find()
      .skip((page - 1) * limit)
      .limit(limit)
      .populate([
        {
          path: 'authorId',
          model: User.name,
        },
      ]);

    const total = await this.postModel.countDocuments();
    return { page, inThisPage: posts.length, total, data: posts };
  }

  // async subFindAll(/* params: FilterDto */) {
  //   try {
  //     // const posts = await this.postModel.find();
  //     // const total = await this.postModel.countDocuments();
  //     // return { page, inThisPage: posts.length, total, data: posts };
  //     this.redisPubSub.publish(SUB_NEW_POSTS, {
  //       [SUB_NEW_POSTS]: {
  //         page: 1,
  //         inThisPage: 3,
  //         total: 4,
  //         // data: posts,
  //       },
  //     });
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  async myPosts(params: FilterInput, userId: string) {
    const { limit = 10, page = 1, tags } = params;
    const filters: FilterQuery<Post> = {};
    filters.user = userId;
    if (tags) {
      /* filters.$or = tags.map((t) => {
        return {
          tags: t,
        };
      }); */
      filters.tags = { $elemMatch: { $in: tags } };
    }
    const posts = await this.postModel
      .find(filters)
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await this.postModel.countDocuments(filters);
    return { page, inThisPage: posts.length, total, data: posts };
  }

  async findOne(id: string) {
    const post = await this.postModel.findById(id).populate([
      {
        path: 'reactions',
        model: User.name,
      },
      {
        path: 'authorId',
        model: User.name,
      },
    ]);
    if (!post) {
      throw new NotFoundException();
    }
    return post;
  }

  async update({ id, ...updatePostDto }: UpdatePostInput, userId: string) {
    const updatedPlanificatedMovement = await this.postModel
      .findOneAndUpdate(
        { $and: [{ user: userId }, { _id: id }] },
        { $set: updatePostDto },
        { new: true },
      )
      .exec();

    if (!updatedPlanificatedMovement) {
      throw new NotFoundException(`Movement with id ${id} not found`);
    }
    return updatedPlanificatedMovement;
  }

  async updateReactions(id: string, userId: string) {
    const post = await this.findOne(id);
    const existReaction = post.reactions.some((r) => r.id === userId);

    if (existReaction) {
      const res = await this.postModel.findByIdAndUpdate(id, {
        $pull: { reactions: userId },
      });
      return res;
    } else {
      const res = await this.postModel.findByIdAndUpdate(id, {
        $push: { reactions: userId },
      });
      return res;
    }
  }

  remove(id: number) {
    return `This action removes a #${id} post`;
  }

  // async commentPost(id: string, userId: string, data: CreatePostInput) {
  //   const post = await this.findOne(id);
  //   const res = await this.postModel.create({
  //     authorId: userId,
  //     type: postTypes.COMMENT,
  //     ...data,
  //   });
  //   post.comments.push(res);

  //   return res;
  // }

  async getCommentsPost(id: string) {
    const comments = await this.postModel.findById(id).populate([
      { path: 'authorId', model: User.name },
      { path: 'comments', model: Post.name },
    ]);
    return comments;
  }
}
