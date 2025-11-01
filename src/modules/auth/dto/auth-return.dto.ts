import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AuthReturnDto {
  @Field(() => String)
  public readonly tokenWs: string;
}
