import { Field, InputType } from '@nestjs/graphql';
import {
  IsArray,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

@InputType()
export class FilterInput {
  @Field(() => Number, { nullable: true })
  @IsOptional()
  @IsNumber()
  limit?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  username?: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsMongoId()
  authorId?: string | null;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  onlyMultimedia?: boolean;

  @Field(() => Number, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cursorDate?: number | null;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
