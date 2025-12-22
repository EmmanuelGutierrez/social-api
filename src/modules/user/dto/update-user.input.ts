import { IsOptional, IsString } from 'class-validator';
import { CreateUserInput } from './create-user.input';
import { InputType, Field, PartialType, OmitType } from '@nestjs/graphql';

@InputType()
export class UpdateUserInput extends OmitType(PartialType(CreateUserInput), [
  'password',
]) {
  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  bio?: string;
}
