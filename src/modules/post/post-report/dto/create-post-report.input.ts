import { InputType, Field } from '@nestjs/graphql';
import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreatePostReportInput {
  @Field(() => String, { nullable: false })
  @IsNotEmpty()
  @IsString()
  reason: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  description?: string;

  @Field(() => String, { nullable: false })
  @IsNotEmpty()
  @IsMongoId()
  postId: string;
}
