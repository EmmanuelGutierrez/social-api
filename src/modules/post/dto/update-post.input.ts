import { PartialType } from '@nestjs/swagger';
import { CreatePostInput } from './create-post.input';
import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class UpdatePostInput extends PartialType(CreatePostInput) {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  public readonly id: string;
}
