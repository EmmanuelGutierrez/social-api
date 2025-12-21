import { Resolver, Mutation, Args, Context, Query } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LoginInput } from './dto/login.input';
import { CreateUserInput } from '../user/dto/create-user.input';
import { AuthReturnDto } from './dto/auth-return.dto';
import { Request, Response } from 'express';
import { config, configType } from 'src/common/config/config';
import { Inject } from '@nestjs/common';
import GraphQLUpload from 'graphql-upload/GraphQLUpload.mjs';
import { FileUpload } from 'graphql-upload/processRequest.mjs';

@Resolver()
export class AuthResolver {
  constructor(
    private auth: AuthService,
    @Inject(config.KEY) private configService: configType,
  ) {}

  @Mutation(() => AuthReturnDto)
  async register(
    @Args('register') data: CreateUserInput,
    @Context() ctx,
    @Args('file', { type: () => GraphQLUpload }) file: FileUpload,
  ) {
    console.log('1');
    const user = await this.auth.register(data, file);
    console.log('2');
    const accessToken = await this.auth.signAccessToken(user);
    console.log('3');
    const refreshToken = await this.auth.createRefreshTokenForUser(user._id);
    console.log('4');
    const wsToken = await this.auth.signAccessTokenWS(user);
    console.log('5');
    ctx.res.cookie('access_token', accessToken, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });
    ctx.res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });

    return { tokenWs: wsToken };
  }

  @Mutation(() => AuthReturnDto)
  async login(@Args('loginInput') data: LoginInput, @Context() ctx) {
    console.log('prod', this.configService.api.env === 'production');
    const user = await this.auth.validateUser(data.email, data.password);
    const accessToken = await this.auth.signAccessToken(user);
    const refreshToken = await this.auth.createRefreshTokenForUser(user._id);
    const wsToken = await this.auth.signAccessTokenWS(user);
    ctx.res.cookie('access_token', accessToken, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      maxAge: 60 * 60 * 1000,

      // path: '/',
    });
    ctx.res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      maxAge: 60 * 60 * 1000 * 7 * 24,

      // path: '/',
    });

    return { tokenWs: wsToken };
  }

  @Mutation(() => AuthReturnDto, { name: 'rotateAccessToken' })
  async rotateAccessToken(@Context() ctx) {
    try {
      const decodeToken = this.auth.decodeToken(
        ctx.req.cookies.access_token as string,
      );
      console.log('REFRESh');
      const newTokens = await this.auth.rotateAccessToken(
        decodeToken.id,
        ctx.req.cookies.refresh_token as string,
      );
      ctx.res.cookie('access_token', newTokens.newToken, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
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
      console.log('decodeToken', decodeToken);
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
