import { InputType, Int, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

@InputType()
export class CreateUserInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsEmail()
  public readonly email: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  public readonly password: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  public readonly name: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  public readonly lastname: string;

  @Field(() => Int)
  @IsNotEmpty()
  @IsNumber()
  public readonly birth_date: number;
}
