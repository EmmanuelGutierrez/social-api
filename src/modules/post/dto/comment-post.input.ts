import { IsNotEmpty, IsString } from 'class-validator';

export class CommentPostInput {
  @IsNotEmpty()
  @IsString()
  body: string;
}
