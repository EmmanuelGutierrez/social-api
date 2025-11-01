import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { roles } from 'src/common/enum/roles.enum';
import { FollowUserDto } from '../dto/user-follow.dto';
import { File } from 'src/modules/file/entities/file.entity';

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

  @Field(() => String)
  @Prop({ type: String, required: true, unique: true })
  email: string;

  @Field(() => File, { nullable: true })
  @Prop({ type: Types.ObjectId, ref: File.name })
  profileImg?: File;

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

  @Field(() => String)
  @Prop({ type: String })
  refreshTokenHash?: string;

  @Field(() => Number)
  @Prop({ type: Number })
  refreshTokenExpiresAt: number;

  @Field(() => [FollowUserDto])
  @Prop({
    type: [
      {
        followDate: { type: Number },
        user: { type: Types.ObjectId, ref: User.name },
      },
    ],
    default: [],
  })
  following: Types.Array<{ followDate: number; user: User }>;

  @Field(() => [FollowUserDto])
  @Prop({
    type: [
      {
        followDate: { type: Number },
        user: { type: Types.ObjectId, ref: User.name },
      },
    ],
    default: [],
  })
  followers: Types.Array<{ followDate: number; user: User }>;

  @Field(() => Number)
  @Prop({ type: Number })
  createdAt: number;

  @Field(() => Number)
  @Prop({ type: Number })
  updatedAt: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
