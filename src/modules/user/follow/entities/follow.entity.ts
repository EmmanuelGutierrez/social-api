import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { User } from '../../entities/user.entity';
import { Types } from 'mongoose';

@ObjectType()
@Schema({ timestamps: true })
export class Follow extends Document {
  @Field(() => User)
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  follower?: User;

  @Field(() => User)
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  following?: User;

  @Field(() => Number)
  @Prop({ type: Number })
  createdAt: number;

  @Field(() => Number)
  @Prop({ type: Number })
  updatedAt: number;
}

export const FollowSchema = SchemaFactory.createForClass(Follow);

FollowSchema.index({ follower: 1, following: 1 }, { unique: true });
FollowSchema.index({ follower: 1 });
FollowSchema.index({ following: 1 });
