import { Field, InputType } from '@nestjs/graphql';
import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

@InputType()
export class CreatePostInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsMongoId()
  replyTo: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  title: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  body: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags: string[];
}
