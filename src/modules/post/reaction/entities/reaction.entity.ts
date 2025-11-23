import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from 'src/modules/user/entities/user.entity';
import { Post } from '../../entities/post.entity';
import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@ObjectType()
@Schema({ timestamps: { createdAt: true, updatedAt: true } })
export class Reaction extends Document {
  @Field(() => ID)
  _id: string;

  @Field(() => User)
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  userId: User;

  @Field(() => User)
  @Prop({ type: Types.ObjectId, ref: Post.name, required: true })
  postId: Post;

  @Field(() => Number)
  @Prop({ type: Number })
  createdAt: number;

  @Field(() => Number)
  @Prop({ type: Number })
  updatedAt: number;
}

export const ReactionSchema = SchemaFactory.createForClass(Reaction);
ReactionSchema.index({ postId: -1, userId: 1 }, { unique: true });
