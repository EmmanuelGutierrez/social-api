import { Resolver, Mutation, Args, Context, Query } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LoginInput } from './dto/login.input';
import { CreateUserInput } from '../user/dto/create-user.input';
import { AuthReturnDto } from './dto/auth-return.dto';
import { Request, Response } from 'express';
import { UploadInput } from '../file/dto/file-upload.dto';

@Resolver()
export class AuthResolver {
  constructor(private auth: AuthService) {}

  @Mutation(() => AuthReturnDto)
  async register(
    @Args('register') data: CreateUserInput,
    @Context() ctx,
    @Args('file') file: UploadInput,
  ) {
    const user = await this.auth.register(data, file.file);
    const accessToken = await this.auth.signAccessToken(user);
    const refreshToken = await this.auth.createRefreshTokenForUser(user._id);
    const wsToken = await this.auth.signAccessTokenWS(user);
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

  @Mutation(() => AuthReturnDto)
  async login(@Args('loginInput') data: LoginInput, @Context() ctx) {
    const user = await this.auth.validateUser(data.email, data.password);
    const accessToken = await this.auth.signAccessToken(user);
    const refreshToken = await this.auth.createRefreshTokenForUser(user._id);
    const wsToken = await this.auth.signAccessTokenWS(user);
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
    try {
      const decodeToken = this.auth.decodeToken(
        ctx.req.cookies.access_token as string,
      );
      console.log('REFRESh', decodeToken, ctx.req.cookies.access_token);
      const newTokens = await this.auth.rotateAccessToken(
        decodeToken.id,
        ctx.req.cookies.refresh_token as string,
      );
      ctx.res.cookie('access_token', newTokens.newToken, {
        httpOnly: true,
        sameSite: 'strict',
      });
      console.log('REFRESh end');
      return { tokenWs: newTokens.newTokenWS };
    } catch (error) {
      console.log('error', error);
    }
  }
  @Mutation(() => Boolean, { name: 'logout' })
  async logout(@Context() ctx: { res: Response; req: Request }) {
    try {
      const decodeToken = this.auth.decodeToken(
        ctx.req.cookies.access_token as string,
      );
      await this.auth.clearRefreshToken(decodeToken.id);
      ctx.res.clearCookie('access_token', {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
      });
      ctx.res.clearCookie('refresh_token', {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
      });
      return true;
    } catch (error) {
      ctx.res.clearCookie('access_token', {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
      });
      ctx.res.clearCookie('refresh_token', {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
      });
      console.log('e', error);
      return false;
    }
  }
}
