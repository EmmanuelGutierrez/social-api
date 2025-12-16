import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { File } from 'src/modules/file/entities/file.entity';
// import { postTypes } from 'src/common/constants/post-types.enum';
// import { File } from 'src/modules/file/entities/file.entity';
import { User } from 'src/modules/user/entities/user.entity';

@ObjectType()
@Schema({
  timestamps: { createdAt: true, updatedAt: true },
  virtuals: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Post extends Document {
  @Field(() => ID)
  _id: string;

  @Field(() => String)
  id: string;

  // @Field(() => postTypes)
  // @Prop({ type: String, enum: postTypes, default: postTypes.POST })
  // type: postTypes;

  @Field(() => String, { nullable: true })
  @Prop({ type: String })
  title?: string;

  @Field(() => String)
  @Prop({ type: String, required: true })
  body: string;

  @Field(() => Number)
  @Prop({
    type: Number,
    default: 0,
  })
  reactionsCount: number;

  // @Field(() => [Post])
  // @Prop({
  //   type: Types.ObjectId,
  //   ref: Post.name,
  //   default: [],
  // })
  // comments: Types.Array<Post>;

  @Field(() => Post, { nullable: true })
  @Prop({ type: Types.ObjectId, ref: Post.name })
  replyTo?: Post;

  @Field(() => [String])
  @Prop({ type: [String] })
  tags: string[];

  /* @Field(() => [String])
  @Prop({ type: [String] })
  images: string[]; */

  @Field(() => [File], { nullable: true })
  @Prop({ type: [Types.ObjectId], ref: File.name })
  images?: File[] | Types.ObjectId[];

  @Field(() => User)
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  authorId: User;

  @Field(() => Number)
  @Prop({ type: Number })
  createdAt: number;

  @Field(() => Number)
  @Prop({ type: Number })
  updatedAt: number;

  @Field(() => [Post], { nullable: true })
  comments?: Post[];
}

export const PostSchema = SchemaFactory.createForClass(Post);
PostSchema.index({ createdAt: -1, authorId: 1 });
PostSchema.virtual('comments', {
  ref: Post.name,
  localField: '_id',
  foreignField: 'replyTo',
});

PostSchema.set('toJSON', { virtuals: true });
PostSchema.set('toObject', { virtuals: true });
