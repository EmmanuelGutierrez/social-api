import { Field, InputType } from '@nestjs/graphql';
import { FileUpload } from 'graphql-upload/processRequest.mjs';
import GraphQLUpload from 'graphql-upload/GraphQLUpload.mjs';

@InputType()
export class MultipleFilesInput {
  @Field(() => [GraphQLUpload])
  files: FileUpload[];
}
