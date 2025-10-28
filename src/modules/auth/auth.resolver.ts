import { Resolver, Mutation, Args, Context, Query } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginInput } from './dto/login.input';
import { CreateUserInput } from '../user/dto/create-user.input';

@Resolver()
export class AuthResolver {
  constructor(private auth: AuthService) {}

  @Mutation(() => String)
  async register(@Args('register') data: CreateUserInput) {
    const user = await this.auth.register(data);
    return `User ${user.email} registered`;
  }

  @Mutation(() => String)
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

    return wsToken;
  }

  @UseGuards(JwtAuthGuard)
  @Query(() => String)
  me(@Context() ctx) {
    const user = ctx.req.user;
    return `Authenticated as ${user.email}`;
  }

  @Query(() => String)
  test() {
    return 'TESTs';
  }
}
