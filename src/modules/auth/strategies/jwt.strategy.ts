import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { tokenType } from 'src/common/enum/tokenType.enum';
import { tokenInfoI } from 'src/common/interfaces/token.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          return req?.cookies?.access_token;
        },
      ]),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any): Promise<tokenInfoI> {
    return {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      type: tokenType.AUTH,
    };
  }
}
