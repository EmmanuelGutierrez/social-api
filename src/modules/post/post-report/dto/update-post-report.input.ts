import { CreatePostReportInput } from './create-post-report.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdatePostReportInput extends PartialType(CreatePostReportInput) {
  @Field(() => Int)
  id: number;
}
