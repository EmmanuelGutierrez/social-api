import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService, // private readonly i18nService: I18nService<I18nTranslations>,
  ) {
    super();
  }
  async validate(username: string, password: string) {
    const user = await this.authService.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException('unauth');
    }
    return user;
  }
}
