import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { Post } from '../../entities/post.entity';
import { Document, Types } from 'mongoose';
import { User } from 'src/modules/user/entities/user.entity';
import { ReportStatus } from 'src/common/enum/reportStatus.enum';

@ObjectType()
export class PostReport extends Document {
  @Field(() => ID)
  _id: string;

  @Field(() => String)
  id: string;

  @Field(() => String)
  @Prop({ type: String, required: true })
  reason: string;

  @Field(() => String, { nullable: true })
  @Prop({ type: String })
  description: string;

  @Field(() => Post)
  @Prop({ type: Types.ObjectId, ref: Post.name, required: true })
  postId: Post;

  @Field(() => User)
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  userId: User;

  @Field(() => Boolean)
  @Prop({ type: Boolean, default: false })
  resolved: boolean;

  @Field(() => ReportStatus)
  @Prop({ type: String, enum: ReportStatus, default: ReportStatus.PENDING })
  status: ReportStatus;

  @Field(() => Number)
  @Prop({ type: Number })
  createdAt: number;

  @Field(() => Number)
  @Prop({ type: Number })
  updatedAt: number;
}

export const PostReportSchema = SchemaFactory.createForClass(PostReport);
