import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostInput } from './dto/create-post.input';
import { UpdatePostInput } from './dto/update-post.input';
import { Post } from './entities/post.entity';
import { FilterQuery, Model, RootFilterQuery, Types } from 'mongoose';
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
import { ReactionService } from './reaction/reaction.service';
import { ReactionInput } from './reaction/dto/reaction.input';
import { FilterFeedPostInput } from './feed-post/dto/filter.input';
import { MyFeedPostDataReturnDto } from './dto/my-feed-post-data-return.dto';
import { RedisService } from '../redis/redis.service';
import { RactPostReturnDto } from './dto/react-post-return.dto';
import { OnePostReturnDto } from './dto/one-post-return.dto';
import { CommentsReturnDto } from './dto/comments-return.dto';
import { FollowService } from '../user/follow/follow.service';
import { PostDataReturnDto } from './dto/post-data-return.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name)
    private readonly postModel: Model<Post>,
    private readonly fileService: FileService,
    private readonly redisPubSub: RedisPubSubService,
    private readonly feedPostService: FeedPostService,
    private readonly userService: UserService,
    private readonly reactionService: ReactionService,
    private readonly redisService: RedisService,
    @InjectQueue(feedPostQueueName) private postQueue: Queue,
    private readonly followService: FollowService,
  ) {}

  private likeCountKey(postId: string) {
    return `post:${postId}:likeCount`;
  }

  private markDirtyKey(postId: string) {
    return `dirty:post:${postId}`;
  }
  private lockKey(postId: string, userId: string) {
    return `lock:like:${postId}:${userId}`;
  }

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

    await this.fileService.createMany(
      filesData,
      post._id,
      `posts/files/${userId}`,
    );
    return post;
  }

  async createWithFilesGraphQL(
    { replyTo, ...data }: CreatePostInput,
    userId: string,
    filesData?: Promise<FileUpload>[],
  ) {
    const user = await this.userService.findById(userId);
    let post: Post;
    if (replyTo) {
      const replyToPost = await this.postModel.findById(replyTo).populate([
        {
          path: 'authorId',
          model: User.name,
        },
      ]);
      if (!replyToPost) {
        throw new NotFoundException();
      }
      post = await this.postModel.create({
        ...data,
        authorId: user,
        replyTo: replyToPost,
        populate: [
          {
            path: 'authorId',
            model: User.name,
            populate: [
              {
                path: 'profileImg',
                model: File.name,
              },
            ],
          },
        ],
      });
    } else {
      post = await this.postModel.create({
        ...data,
        authorId: user,
        populate: [
          {
            path: 'authorId',
            model: User.name,
            populate: [
              {
                path: 'profileImg',
                model: File.name,
              },
            ],
          },
          {
            path: 'images',
            model: File.name,
          },
        ],
      });
    }

    if (filesData) {
      const files = await this.fileService.createManyGraphql(
        filesData,
        post._id,
        `posts/files/${userId}`,
      );
      post.images = files.map((file) => file._id);
      await post.save();
    }
    // await this.redisPubSub.publish(SUB_NEW_POSTS, {
    //   [SUB_NEW_POSTS]: post,
    // });
    await this.feedPostService.create({
      postId: post._id,
      userId: userId,
    });
    // const followers = await this.followService.getFollowers(userId);
    for (const follower of user.followers) {
      await this.postQueue.add('addToFeed', {
        postId: post._id,
        followerId: follower.follower._id,
        authorId: userId,
        authorUsername: user.username,
        authorProfileImg: user.profileImg.secure_url,
      });
    }
    return post.populate([{ path: 'images', model: File.name }]);
  }

  async postWithUserLikes(posts: Post[], userId: string) {
    const postIds = posts.map((c) => c.id);
    const likes = await this.reactionService.findReactionsForPosts(
      userId,
      postIds,
    );
    const likeCounts = await this.redisService.mget(
      postIds.map((p) => this.likeCountKey(p)),
    );

    const likesIds = likes.map((l) => String(l.postId));
    const postsWithMyLikes: OnePostReturnDto[] = [];
    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      const replyCount = await this.postModel.countDocuments({
        replyTo: post._id,
      });
      if (likesIds.includes(String(post._id))) {
        postsWithMyLikes.push({
          post,
          iLiked: true,
          likeCount: Number(likeCounts[i]) || 0,
          replyCount,
        });
      } else {
        postsWithMyLikes.push({
          post,
          iLiked: false,
          likeCount: Number(likeCounts[i]) || 0,
          replyCount,
        });
      }
    }
    return postsWithMyLikes;
  }

  async getLikedPosts(params: FilterInput) {
    const { limit = 10, cursorDate, username, authorId } = params;
    let user: User;
    const query: RootFilterQuery<Post> = {
      createdAt: { $lt: cursorDate || new Date().getTime() },
    };

    if (username && !authorId) {
      const res = await this.userService.findByUsername(username);
      user = res.user;
    }
    if ((authorId && !username) || (authorId && !user)) {
      user = await this.userService.findById(authorId);
    }

    const reactions = await this.reactionService.getMyReactions(
      user._id.toString(),
    );
    const reactionsIds = reactions.map((r) => r.postId);
    query._id = { $in: reactionsIds };
    const posts = await this.postModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .populate([
        {
          path: 'authorId',
          model: User.name,
          populate: { path: 'profileImg', model: File.name },
        },
        {
          path: 'replyTo',
          model: Post.name,
          populate: [
            {
              path: 'authorId',
              model: User.name,
              populate: { path: 'profileImg', model: File.name },
            },
          ],
        },
        {
          path: 'images',
          model: File.name,
        },
      ]);

    const hasMore = posts.length > limit;
    const data = hasMore ? posts.slice(0, limit) : posts;
    const nextCursor = hasMore ? posts[posts.length - 1].createdAt + 1 : null;
    const postsWithMyLikes = await this.postWithUserLikes(data, user._id);
    return {
      nextCursor,
      data: postsWithMyLikes,
      hasMore,
    };
  }

  async findAll(params: FilterInput): Promise<PostDataReturnDto> {
    const {
      limit = 10,
      cursorDate,
      username,
      authorId,
      onlyMultimedia,
    } = params;
    let user: User;
    const query: RootFilterQuery<Post> = {
      createdAt: { $lt: cursorDate || new Date().getTime() },
    };

    if (username && !authorId) {
      const res = await this.userService.findByUsername(username);
      user = res.user;
      query.authorId = user._id;
    }
    if ((authorId && !username) || (authorId && !user)) {
      user = await this.userService.findById(authorId);
      query.authorId = user._id;
    }
    if (onlyMultimedia) {
      query['images.0'] = { $exists: true };
    }
    // if ((userLiked && userId) || (userLiked && username)) {
    //   // query.isLiked = userLiked;
    //   const likedPosts = await this.reactionService.getMyReactions(user._id);
    //   query._id = { $in: likedPosts.map((post) => post.postId) };
    // }

    if (!username && !authorId) {
      throw new BadRequestException('username or authorId is required');
    }

    const posts = await this.postModel
      .find(query)
      .sort({ createdAt: -1 })
      // .skip((page - 1) * limit)
      .limit(limit + 1)
      .populate([
        {
          path: 'authorId',
          model: User.name,
          populate: { path: 'profileImg', model: File.name },
        },
        {
          path: 'replyTo',
          model: Post.name,
          populate: [
            {
              path: 'authorId',
              model: User.name,
              populate: { path: 'profileImg', model: File.name },
            },
          ],
        },
        {
          path: 'images',
          model: File.name,
        },
      ]);

    const hasMore = posts.length > limit;
    const data = hasMore ? posts.slice(0, limit) : posts;
    const nextCursor = hasMore ? posts[posts.length - 1].createdAt + 1 : null;
    return {
      nextCursor,
      data,
      hasMore,
    };
  }

  async getPostsByIds(
    ids: string[],
    userId: string,
  ): Promise<OnePostReturnDto[]> {
    const posts: Post[] = await this.postModel
      .find({ _id: { $in: ids } })
      .populate([
        {
          path: 'authorId',
          model: User.name,
          populate: [
            {
              path: 'profileImg',
              model: File.name,
            },
          ],
        },
        {
          path: 'replyTo',
          model: Post.name,
          populate: [
            {
              path: 'authorId',
              model: User.name,
              populate: [
                {
                  path: 'profileImg',
                  model: File.name,
                },
              ],
            },
            { path: 'images', model: File.name },
          ],
        },
        {
          path: 'images',
          model: File.name,
        },
      ]);
    if (!posts.length) {
      return [];
    }
    const postsWithMyLikes = await this.postWithUserLikes(posts, userId);
    return postsWithMyLikes;
  }

  async getAncestors(
    id: string,
    limit: number,
    userId: string,
  ): Promise<CommentsReturnDto> {
    const post: Post = await this.postModel.findById(id).populate([
      {
        path: 'authorId',
        model: User.name,
        populate: [
          {
            path: 'profileImg',
            model: File.name,
          },
        ],
      },
      {
        path: 'replyTo',
        model: Post.name,
        populate: [
          {
            path: 'authorId',
            model: User.name,
            populate: [
              {
                path: 'profileImg',
                model: File.name,
              },
            ],
          },
          { path: 'images', model: File.name },
        ],
      },
      {
        path: 'images',
        model: File.name,
      },
    ]);
    if (!post) {
      throw new NotFoundException();
    }
    let currentPost = post.replyTo;
    if (!currentPost) {
      return {
        data: [],
        hasMore: false,
        nextCursor: null,
      };
    }
    const likeCount = await this.redisService.get(
      this.likeCountKey(currentPost._id),
    );
    const iLiked = await this.reactionService.existReaction({
      postId: currentPost._id,
      userId,
    });
    const replyCount = await this.postModel.countDocuments({
      replyTo: currentPost._id,
    });
    const ancestors: OnePostReturnDto[] = [
      {
        iLiked,
        likeCount: Number(likeCount) || 0,
        post: currentPost,
        replyCount,
      },
    ];
    for (let i = 0; i <= limit; i++) {
      if (!currentPost.replyTo) {
        break;
      }
      const parent = await this.postModel
        .findById(currentPost.replyTo._id)
        .populate([
          {
            path: 'authorId',
            model: User.name,
            populate: [
              {
                path: 'profileImg',
                model: File.name,
              },
            ],
          },
          {
            path: 'replyTo',
            model: Post.name,
            populate: [
              {
                path: 'authorId',
                model: User.name,
                populate: [
                  {
                    path: 'profileImg',
                    model: File.name,
                  },
                ],
              },
              { path: 'images', model: File.name },
            ],
          },
          {
            path: 'images',
            model: File.name,
          },
        ]);
      if (!parent) {
        break;
      }
      const likeCountParentPost = await this.redisService.get(
        this.likeCountKey(parent._id),
      );
      const iLikedParentPost = await this.reactionService.existReaction({
        postId: parent._id,
        userId,
      });
      const replyCountParentPost = await this.postModel.countDocuments({
        replyTo: parent._id,
      });
      ancestors.push({
        iLiked: iLikedParentPost,
        likeCount: Number(likeCountParentPost) || 0,
        post: parent,
        replyCount: replyCountParentPost,
      });
      currentPost = parent;
    }
    const hasMore = ancestors.length > limit;
    const data = hasMore ? ancestors.slice(0, limit) : ancestors;
    const nextCursor = hasMore ? ancestors[limit - 1].post._id : undefined;
    return { hasMore, nextCursor, data: data.reverse() };
  }

  async getReplies(
    { id, limit, cursor }: { id: string; limit: number; cursor?: string },
    userId: string,
  ): Promise<CommentsReturnDto> {
    const query: FilterQuery<Post> = { replyTo: new Types.ObjectId(id) };
    if (cursor) {
      query._id = {
        $lt: new Types.ObjectId(cursor),
      };
    }

    const replies: Post[] = await this.postModel
      .find(query)
      .limit(limit + 1)
      .sort({ createdAt: -1 })
      .populate([
        {
          path: 'replyTo',
          model: Post.name,
          populate: [
            {
              path: 'authorId',
              model: User.name,
            },
          ],
        },
        {
          path: 'authorId',
          model: User.name,
          populate: [
            {
              path: 'profileImg',
              model: File.name,
            },
          ],
        },
        {
          path: 'comments',
          model: Post.name,
          populate: [
            {
              path: 'authorId',
              model: User.name,
              populate: [
                {
                  path: 'profileImg',
                  model: File.name,
                },
              ],
            },
            { path: 'images', model: File.name },
          ],
        },
        {
          path: 'images',
          model: File.name,
        },
      ]);
    if (!replies.length) return { data: [], hasMore: false, nextCursor: null };
    const repliesWithMyLikes = await this.postWithUserLikes(replies, userId);
    const hasMore = repliesWithMyLikes.length > limit;
    const data = hasMore
      ? repliesWithMyLikes.slice(0, limit)
      : repliesWithMyLikes;
    const nextCursor = hasMore
      ? repliesWithMyLikes[limit - 1].post.id
      : undefined;

    return { data, hasMore, nextCursor };
  }

  async getAllComments(id: string, userId: string) {
    const ancestors = await this.getAncestors(id, 5, userId);
    const replies = await this.getReplies(
      { id, limit: 5, cursor: undefined },
      userId,
    );
    return { ancestors, replies };
  }

  async getPostWithAllComments(id: string, userId: string) {
    const post = await this.getOne({ postId: id, userId });
    const comments = await this.getAllComments(id, userId);
    return { post, ancestors: comments.ancestors, replies: comments.replies };
  }

  async postByUser(params: FilterInput, userId: string) {
    const postsData = await this.findAll(params);
    const postsWithMyLikes = await this.postWithUserLikes(
      postsData.data,
      userId,
    );
    return {
      nextCursor: postsData.nextCursor,
      // inThisPage: feedPostsData.inThisPage,
      // inDb: feedPostsData.inDb,
      hasMore: postsData.hasMore,
      data: postsWithMyLikes,
    };
  }

  async findOne(id: string) {
    const post = await this.postModel.findById(id).populate([
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

  async getOne(data: ReactionInput): Promise<OnePostReturnDto> {
    const post = await this.postModel.findById(data.postId).populate([
      {
        path: 'authorId',
        model: User.name,
        populate: {
          path: 'profileImg',
          model: File.name,
        },
      },
      {
        path: 'images',
        model: File.name,
      },
      {
        path: 'replyTo',
        model: Post.name,
        populate: {
          path: 'authorId',
          model: User.name,
          populate: {
            path: 'profileImg',
            model: File.name,
          },
        },
      },
      {
        path: 'comments',
        model: Post.name,
      },
    ]);

    const likeCount = await this.redisService.get(this.likeCountKey(post._id));
    const iLiked = await this.reactionService.existReaction(data);
    const replyCount = await this.postModel.countDocuments({
      replyTo: post._id,
    });
    if (!post) {
      throw new NotFoundException();
    }
    return {
      iLiked,
      likeCount: Number(likeCount) || 0,
      post,
      replyCount,
    };
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

  // async updateReactions(id: string, userId: string) {
  //   const post = await this.findOne(id);
  //   const existReaction = post.reactions.some((r) => r.id === userId);

  //   if (existReaction) {
  //     const res = await this.postModel.findByIdAndUpdate(id, {
  //       $pull: { reactions: userId },
  //     });
  //     return res;
  //   } else {
  //     const res = await this.postModel.findByIdAndUpdate(id, {
  //       $push: { reactions: userId },
  //     });
  //     return res;
  //   }
  // }

  async reactPost(data: ReactionInput) {
    const post = await this.findOne(data.postId);
    const existReaction = await this.reactionService.existReaction(data);
    if (existReaction) {
      await this.reactionService.removeReaction(data);
      post.reactionsCount -= 1;
    } else {
      await this.reactionService.createReaction(data);
      post.reactionsCount += 1;
    }
    return await post.save();
  }

  /* async toggleLikePost(data: ReactionInput): Promise<RactPostReturnDto> {
    const lock = await this.redisService.set(
      this.lockKey(data.postId, data.userId),
      '1',
      10,
    );
    if (!lock) {
      return {
        ignored: true,
        // liked: false,
      };
    }
    const insertResult = await this.reactionService.upsertReaction(data);
    if (insertResult.upsertedId) {
      await this.redisService.increment(this.likeCountKey(data.postId));
      await this.redisService.set(this.markDirtyKey(data.postId), 0);
      await this.postQueue.add(
        'syncPost',
        { postId: data.postId },
        { jobId: data.postId },
      );
      return { ignored: false };
    }
    const deletedResult = await this.reactionService.removeReaction(data);
    if (deletedResult) {
      const newVal = await this.redisService.decrement(
        this.likeCountKey(data.postId),
      );
      if (newVal < 0) {
        await this.redisService.set(this.likeCountKey(data.postId), 0);
      }
      await this.redisService.set(this.markDirtyKey(data.postId), 1);
      await this.postQueue.add(
        'syncPost',
        { postId: data.postId },
        { jobId: data.postId },
      );
      return { ignored: false };
    }
    return { ignored: false };
  } */

  async likePost(data: ReactionInput): Promise<RactPostReturnDto> {
    const lock = await this.redisService.set(
      this.lockKey(data.postId, data.userId),
      '1',
      10,
    );
    console.log(lock);
    const likeCount = await this.getLikesCount(data.postId);
    if (!lock) {
      return {
        ignored: true,
        likedCount: likeCount,
        // liked: false,
      };
    }
    const insertResult = await this.reactionService.upsertReaction(data);
    if (insertResult.upsertedId) {
      const likedCount = await this.redisService.increment(
        this.likeCountKey(data.postId),
      );
      await this.redisService.set(this.markDirtyKey(data.postId), 0);
      await this.postQueue.add(
        'syncPost',
        { postId: data.postId },
        { jobId: data.postId },
      );
      return { ignored: false, likedCount };
    } else {
      throw new ConflictException('You already liked this post');
    }
    // return { ignored: false };
  }

  async dislikePost(data: ReactionInput): Promise<RactPostReturnDto> {
    const lock = await this.redisService.set(
      this.lockKey(data.postId, data.userId),
      '1',
      10,
    );
    const likeCount = await this.getLikesCount(data.postId);
    if (!lock) {
      return {
        ignored: true,
        likedCount: likeCount,
        // liked: false,
      };
    }
    const deletedResult = await this.reactionService.removeReaction(data);
    if (deletedResult) {
      const newVal = await this.redisService.decrement(
        this.likeCountKey(data.postId),
      );
      if (newVal < 0) {
        await this.redisService.set(this.likeCountKey(data.postId), 0);
      }
      await this.redisService.set(this.markDirtyKey(data.postId), 1);
      await this.postQueue.add(
        'syncPost',
        { postId: data.postId },
        { jobId: data.postId },
      );
      return { ignored: false, likedCount: newVal < 0 ? 0 : newVal };
    } else {
      throw new ConflictException('You already disliked this post');
    }
  }

  async getLikesCount(postId: string) {
    const count = await this.redisService.get(this.likeCountKey(postId));
    return Number(count) || 0;
  }

  async myFeed(
    params: FilterFeedPostInput,
    userId: string,
  ): Promise<MyFeedPostDataReturnDto> {
    const feedPostsData = await this.feedPostService.findAll(params, userId);
    const postIds = feedPostsData.data.map((p) => p.postId.id);
    const likes = await this.reactionService.findReactionsForPosts(
      userId,
      postIds,
    );
    const likeCounts = await this.redisService.mget(
      postIds.map((p) => this.likeCountKey(p)),
    );

    const likesIds = likes.map((l) => String(l.postId));
    const feedWithMyLikes: OnePostReturnDto[] = [];
    for (let i = 0; i < feedPostsData.data.length; i++) {
      const feedPost = feedPostsData.data[i];
      const replyCount = await this.postModel.countDocuments({
        replyTo: feedPost.postId._id,
      });
      if (likesIds.includes(String(feedPost.postId._id))) {
        feedWithMyLikes.push({
          post: feedPost.postId,
          iLiked: true,
          likeCount: Number(likeCounts[i]) || 0,
          replyCount,
        });
      } else {
        feedWithMyLikes.push({
          post: feedPost.postId,
          iLiked: false,
          likeCount: Number(likeCounts[i]) || 0,
          replyCount,
        });
      }
    }
    return {
      nextCursor: feedPostsData.nextCursor,
      // inThisPage: feedPostsData.inThisPage,
      // inDb: feedPostsData.inDb,
      hasMore: feedPostsData.hasMore,
      data: feedWithMyLikes,
    };
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

  // async getCommentsPost(id: string) {
  //   const comments = await this.postModel.findById(id).populate([
  //     { path: 'authorId', model: User.name },
  //     { path: 'comments', model: Post.name },
  //   ]);
  //   return comments;
  // }
}
