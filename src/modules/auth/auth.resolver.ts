import { Resolver, Mutation, Args, Context, Query } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LoginInput } from './dto/login.input';
import { CreateUserInput } from '../user/dto/create-user.input';
import { AuthReturnDto } from './dto/auth-return.dto';

@Resolver()
export class AuthResolver {
  constructor(private auth: AuthService) {}

  @Mutation(() => String)
  async register(@Args('register') data: CreateUserInput) {
    const user = await this.auth.register(data);
    return `User ${user.email} registered`;
  }

  @Mutation(() => AuthReturnDto)
  async login(@Args('loginInput') data: LoginInput, @Context() ctx) {
    const user = await this.auth.validateUser(data.email, data.password);
    const accessToken = await this.auth.signAccessToken(user);
    const refreshToken = await this.auth.createRefreshTokenForUser(user._id);
    const wsToken = await this.auth.signAccessTokenWS(user);
    console.log('WS TOKEN', wsToken);
    ctx.res.cookie('access_token', accessToken, {
      httpOnly: true,
      sameSite: 'strict',
    });
    ctx.res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
    });

    return { tokenWs: wsToken };
  }

  @Query(() => AuthReturnDto, { name: 'rotateAccessToken' })
  async rotateAccessToken(@Context() ctx) {
    const decodeToken = this.auth.decodeToken(
      ctx.req.cookies.access_token as string,
    );
    const newTokens = await this.auth.rotateAccessToken(
      decodeToken.id,
      ctx.req.cookies.refresh_token as string,
    );
    ctx.res.cookie('access_token', ctx.req.cookies.access_token, {
      httpOnly: true,
      sameSite: 'strict',
    });
    ctx.res.cookie('refresh_token', newTokens.newToken, {
      httpOnly: true,
      sameSite: 'strict',
    });

    return { tokenWs: newTokens.newTokenWS };
  }
}
