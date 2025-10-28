import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class LoginInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsEmail()
  public readonly email: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  public readonly password: string;
}
