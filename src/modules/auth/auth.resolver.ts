import { Resolver, Mutation, Args, Context, Query } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Resolver()
export class AuthResolver {
  constructor(private auth: AuthService) {}

  @Mutation(() => String)
  async register(
    @Args('email') email: string,
    @Args('password') password: string,
  ) {
    const user = await this.auth.register(email, password);
    return `User ${user.email} registered`;
  }

  @Mutation(() => String)
  async login(
    @Args('email') email: string,
    @Args('password') password: string,
    @Context() ctx,
  ) {
    const user = await this.auth.validateUser(email, password);
    const accessToken = await this.auth.signAccessToken(user);
    const refreshToken = await this.auth.createRefreshTokenForUser(user._id);

    ctx.res.cookie('access_token', accessToken, {
      httpOnly: true,
      sameSite: 'strict',
    });
    ctx.res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
    });

    return accessToken;
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
