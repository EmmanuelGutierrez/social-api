import { ObjectType, Field } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { User } from 'src/modules/user/entities/user.entity';
import { Post } from '../../entities/post.entity';

@ObjectType()
@Schema({ timestamps: { createdAt: true, updatedAt: true } })
export class FeedPost {
  @Field(() => User)
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  userId: User;

  @Field(() => Post)
  @Prop({ type: Types.ObjectId, ref: Post.name, required: true })
  postId: Post;

  @Field(() => Number)
  @Prop({ type: Number })
  createdAt: number;

  @Field(() => Number)
  @Prop({ type: Number })
  updatedAt: number;
}

export const FeedPostSchema = SchemaFactory.createForClass(FeedPost);
FeedPostSchema.index({ createdAt: -1, userId: 1 });
