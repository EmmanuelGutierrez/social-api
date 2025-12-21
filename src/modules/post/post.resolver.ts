import {
  Resolver,
  Query,
  Mutation,
  Args,
  Context,
  Subscription,
  Int,
} from '@nestjs/graphql';
import { PostService } from './post.service';
import { Post } from './entities/post.entity';
import { CreatePostInput } from './dto/create-post.input';
import { UpdatePostInput } from './dto/update-post.input';
import { GraphQLContext } from 'src/common/interfaces/ctx-graphql';
import { PostDataReturnDto } from './dto/post-data-return.dto';
import { FilterInput } from './dto/filter.input';
import { RedisPubSubService } from '../redis-pub-sub/redis-pub-sub.service';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { tokenInfoI } from 'src/common/interfaces/token.interface';

import GraphQLUpload from 'graphql-upload/GraphQLUpload.mjs';
import { FileUpload } from 'graphql-upload/processRequest.mjs';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IsSubscription } from 'src/common/decorators/isSubscription.decorator';
import { SubDataReturnDto } from './dto/sub-data-return.dto';
import { UploadInputArray } from '../file/dto/file-upload.dto';
import { FilterFeedPostInput } from './feed-post/dto/filter.input';
import { MyFeedPostDataReturnDto } from './dto/my-feed-post-data-return.dto';
import { RactPostReturnDto } from './dto/react-post-return.dto';
import { OnePostReturnDto } from './dto/one-post-return.dto';
import { CommentsReturnDto } from './dto/comments-return.dto';
import {
  OnlyAllComments,
  PostAndAllComments,
} from './dto/post-and-comments.dto';

@UseGuards(JwtAuthGuard)
@Resolver(() => Post)
export class PostResolver {
  constructor(
    private readonly postService: PostService,
    private readonly redisPubSub: RedisPubSubService,
  ) {}

  // @Mutation(() => String, { name: 'image' })
  // async createPost(
  //   @Args('file', { type: () => GraphQLUpload }) file: FileUpload,
  // ) {
  //   console.log('File1', file);
  //   return 1;
  // }

  // @Mutation(() => Int, { name: 'multipleImages' })
  // async createPost2(
  //   @Args('files', { type: () => [GraphQLUpload] }) file: Promise<FileUpload>[],
  //   @Context() ctx: GraphQLContext,
  // ) {
  //   const newfiles: FileUpload[] = [];
  //   for (const f in file) {
  //     const awaitedFile = await file[f];
  //     newfiles.push(awaitedFile);
  //   }
  //   const res = await this.postService.createWithFiles(
  //     { body: '', title: '', tags: [] },
  //     ctx.req.user.id,
  //     newfiles,
  //   );
  // }

  @Mutation(() => Post, { name: 'createPost' })
  create(
    @Args('data') data: CreatePostInput,
    @Context() ctx: GraphQLContext,
    @Args('files', { type: () => [GraphQLUpload] })
    files: Promise<FileUpload>[],
  ) {
    return this.postService.createWithFilesGraphQL(
      data,
      ctx.req.user.id,
      files,
    );
  }

  @Query(() => Int, { name: 'getLikesCount' })
  getLikesCount(@Args('postId') postId: string) {
    return this.postService.getLikesCount(postId);
  }

  @Query(() => [OnePostReturnDto], { name: 'getPostsByIds' })
  getPostsByIds(
    @CurrentUser() tokenData: tokenInfoI,
    @Args('postsIds', { type: () => [String] })
    postsIds: string[],
  ) {
    return this.postService.getPostsByIds(postsIds, tokenData.id);
  }

  @Query(() => CommentsReturnDto, { name: 'getComments' })
  getComments(
    @Args('postId') postId: string,
    @CurrentUser() tokenData: tokenInfoI,
    @Args('cursor', { type: () => String, nullable: true }) cursor?: string,
  ) {
    return this.postService.getReplies(
      { id: postId, cursor, limit: 5 },
      tokenData.id,
    );
  }

  @Query(() => CommentsReturnDto, { name: 'getAncestorsComments' })
  getAncestorsComments(
    @Args('postId') postId: string,
    @CurrentUser() tokenData: tokenInfoI,
  ) {
    return this.postService.getAncestors(postId, 5, tokenData.id);
  }

  @Query(() => OnlyAllComments, { name: 'getAllComments' })
  getAllComments(
    @Args('postId') postId: string,
    @CurrentUser() tokenData: tokenInfoI,
  ) {
    return this.postService.getAllComments(postId, tokenData.id);
  }

  @Query(() => PostAndAllComments, { name: 'postAndAllComments' })
  postAndAllComments(
    @Args('postId') postId: string,
    @CurrentUser() tokenData: tokenInfoI,
  ) {
    return this.postService.getPostWithAllComments(postId, tokenData.id);
  }

  @Query(() => MyFeedPostDataReturnDto, { name: 'myFeed' })
  myFeed(
    @Args('params') params: FilterFeedPostInput,
    @CurrentUser() tokenData: tokenInfoI,
  ) {
    return this.postService.myFeed(params, tokenData.id);
  }

  @Query(() => MyFeedPostDataReturnDto, { name: 'userPosts' })
  userPosts(
    @Args('params') params: FilterInput,
    @CurrentUser() tokenData: tokenInfoI,
  ) {
    return this.postService.postByUser(params, tokenData.id);
  }

  @Query(() => MyFeedPostDataReturnDto, { name: 'likedPosts' })
  likedPosts(@Args('params') params: FilterInput) {
    return this.postService.getLikedPosts(params);
  }

  // @Query(() => PostDataReturnDto, { name: 'allPosts' })
  // findAll(@Args('params') params: FilterInput) {
  //   return this.postService.findAll(params);
  // }

  @IsSubscription()
  @Subscription(() => SubDataReturnDto, {
    resolve: (payload: {
      subNewPosts: {
        postId: string;
        authorId: string;
        authorUsername: string;
        authorProfileImg: string;
      };
    }) => {
      return payload.subNewPosts;
    },
  })
  subNewPosts(
    // @Args('params') params: FilterDto,
    @CurrentUser() tokenData: tokenInfoI,
  ) {
    console.log('tokenData', tokenData);
    // return this.postService.findAll(params);
    return this.redisPubSub.asyncIterator(`SUB_NEW_POSTS-${tokenData.id}`);
  }

  // @Query(() => PostDataReturnDto, { name: 'myPosts' })
  // findMe(
  //   @Args('params') params: FilterInput,
  //   @CurrentUser() tokenData: tokenInfoI,
  // ) {
  //   return this.postService.myPosts(params, tokenData.id);
  // }

  @Query(() => OnePostReturnDto, { name: 'getOne' })
  findOne(@Args('id') id: string, @CurrentUser() tokenData: tokenInfoI) {
    return this.postService.getOne({ postId: id, userId: tokenData.id });
  }

  @Mutation(() => Post, { name: 'updatePost' })
  update(
    @Args('data') data: UpdatePostInput,
    @CurrentUser() tokenData: tokenInfoI,
  ) {
    return this.postService.update(data, tokenData.id);
  }
  // @Mutation(() => RactPostReturnDto, { name: 'reactPost' })
  // async reactPosts(
  //   @Args('id') id: string,
  //   @CurrentUser() tokenData: tokenInfoI,
  // ) {
  //   return await this.postService.toggleLikePost({
  //     postId: id,
  //     userId: tokenData.id,
  //   });
  // }

  @Mutation(() => RactPostReturnDto, { name: 'likePost' })
  async likePost(@Args('id') id: string, @CurrentUser() tokenData: tokenInfoI) {
    return await this.postService.likePost({
      postId: id,
      userId: tokenData.id,
    });
  }

  @Mutation(() => RactPostReturnDto, { name: 'dislikePost' })
  async dislikePost(
    @Args('id') id: string,
    @CurrentUser() tokenData: tokenInfoI,
  ) {
    return await this.postService.dislikePost({
      postId: id,
      userId: tokenData.id,
    });
  }

  // @Mutation(() => Post, { name: 'comment' })
  // async commentPost(
  //   @Args('data') data: CreatePostInput,
  //   @Args('id') id: string,
  //   @CurrentUser() tokenData: tokenInfoI,
  // ) {
  //   return await this.postService.commentPost(id, tokenData.id, data);
  // }

  // @Query(() => Post, { name: 'getComments' })
  // async getCommentPost(@Args('id') id: string) {
  //   return await this.postService.getCommentsPost(id);
  // }
}
