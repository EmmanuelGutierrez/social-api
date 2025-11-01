import { Controller, Get, Res, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { tokenInfoI } from 'src/common/interfaces/token.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  //   @UseGuards(JwtExpressAuthGuard)
  @Get('/rotate-access-token')
  async rotateAccessToken(
    @Res() res: Response,
    @Req()
    req: Request & {
      user: tokenInfoI;
      cookies: { access_token?: string; refresh_token?: string };
    },
  ) {
    const decodeToken = this.authService.decodeToken(req.cookies.access_token);
    const newTokens = await this.authService.rotateAccessToken(
      decodeToken.id,
      req.cookies.refresh_token,
    );
    res.cookie('access_token', req.cookies.access_token, {
      httpOnly: true,
      sameSite: 'strict',
    });
    res.cookie('refresh_token', newTokens.newToken, {
      httpOnly: true,
      sameSite: 'strict',
    });

    res.json({ tokenWs: newTokens.newTokenWS }).send();
  }
}
