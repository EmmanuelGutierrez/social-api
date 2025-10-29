import { Field, InputType, Int } from '@nestjs/graphql';
import { IsArray, IsNumber, IsOptional, IsString, Min } from 'class-validator';

@InputType()
export class FilterFeedPostInput {
  @Field(() => Number, { nullable: true })
  @IsOptional()
  @IsNumber()
  limit?: number;

  // @Field(() => Number, { nullable: true })
  // @IsOptional()
  // @IsNumber()
  // @Min(0)
  // page?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cursorDate?: number;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
