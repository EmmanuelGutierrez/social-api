import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { roles } from 'src/common/enum/roles.enum';
import { File } from 'src/modules/file/entities/file.entity';
import { Follow } from '../follow/entities/follow.entity';

@ObjectType()
@Schema({ timestamps: true })
export class User extends Document {
  @Field(() => ID)
  _id: string;

  @Field(() => String)
  @Prop({ type: String, required: true })
  name: string;

  @Field(() => String)
  @Prop({ type: String, required: true })
  lastname: string;

  @Field(() => String)
  @Prop({ type: String, required: true, unique: true })
  username: string;

  @Field(() => String, { nullable: true })
  @Prop({ type: String, nullable: true })
  bio: string;

  @Field(() => String)
  @Prop({ type: String, required: true, unique: true })
  email: string;

  @Field(() => File, { nullable: true })
  @Prop({ type: Types.ObjectId, ref: File.name, required: false })
  profileImg?: File;

  @Field(() => File, { nullable: true })
  @Prop({ type: Types.ObjectId, ref: File.name, required: false })
  bannerImg?: File;

  // @Field(() => String)
  @Prop({
    type: String,
    required: true,
    validators: { minlength: 8 },
    select: false,
  })
  password: string;

  @Field(() => roles)
  @Prop({ type: String, enum: roles, required: true, default: roles.USER })
  role: roles;

  @Prop({ type: String, select: false })
  refreshTokenHash?: string;

  @Prop({ type: Number, select: false })
  refreshTokenExpiresAt?: number;

  @Field(() => [Follow], { nullable: true })
  following: Follow[];

  @Field(() => [Follow], { nullable: true })
  followers: Follow[];

  @Field(() => Number)
  @Prop({ type: Number, default: 0 })
  followingCount: number;

  @Field(() => Number)
  @Prop({ type: Number, default: 0 })
  followersCount: number;

  @Field(() => Number, { nullable: true })
  @Prop({ type: Number, nullable: true })
  birth_date: number;

  @Field(() => Number)
  @Prop({ type: Number })
  createdAt: number;

  @Field(() => Number)
  @Prop({ type: Number })
  updatedAt: number;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.virtual('following', {
  ref: Follow.name,
  localField: '_id',
  foreignField: 'follower',
});

UserSchema.virtual('followers', {
  ref: Follow.name,
  localField: '_id',
  foreignField: 'following',
});

UserSchema.set('toObject', { virtuals: true });
UserSchema.set('toJSON', { virtuals: true });
