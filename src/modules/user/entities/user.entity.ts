import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { roles } from 'src/common/enum/roles.enum';

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
  email: string;

  // @Field(() => String)
  @Prop({ type: String, required: true, select: false })
  password: string;

  @Field(() => String)
  @Prop({ type: String, required: true, default: roles.USER })
  role: roles;

  @Field(() => String)
  @Prop({ type: String })
  refreshTokenHash?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
