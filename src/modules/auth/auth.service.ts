import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { UserService } from '../user/user.service';
import { CreateUserInput } from '../user/dto/create-user.input';
import { tokenInfoI } from 'src/common/interfaces/token.interface';
import { User } from '../user/entities/user.entity';
import { config, configType } from 'src/common/config/config';
import { tokenType } from 'src/common/enum/tokenType.enum';
import { FileUpload } from 'graphql-upload/processRequest.mjs';

@Injectable()
export class AuthService {
  private wsJwt: JwtService;

  constructor(
    private userService: UserService,
    private jwt: JwtService,

    @Inject(config.KEY) private configService: configType,
  ) {
    this.wsJwt = new JwtService({ secret: this.configService.api.wsJwtSecret });
  }

  async register({ password, ...data }: CreateUserInput, file?: FileUpload) {
    const hash: string = await bcrypt.hash(password, 12);
    return this.userService.createUser({ ...data, password: hash }, file);
  }

  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmailWithPassword(email);
    if (!user) throw new UnauthorizedException();
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new UnauthorizedException();
    return user;
  }

  async signAccessTokenWS(user: User) {
    const payload: tokenInfoI = {
      id: user._id,
      email: user.email,
      role: user.role,
      type: tokenType.WS,
    };
    return this.wsJwt.sign(payload, {
      expiresIn: '15m',
    });
  }

  async signAccessToken(user: User) {
    const payload: tokenInfoI = {
      id: user._id,
      email: user.email,
      role: user.role,
      type: tokenType.AUTH,
    };
    return this.jwt.sign(payload);
  }

  async createRefreshTokenForUser(userId: string) {
    // const token = crypto.randomBytes(64).toString('hex');
    // const hash: string = await bcrypt.hash(token, 12);
    // await this.userService.setRefreshTokenHash(userId, hash);
    // return token;

    const refreshToken = crypto.randomBytes(64).toString('hex');
    const refreshTokenHash = await bcrypt.hash(refreshToken, 12);

    const refreshTokenExpiresAt =
      new Date().getTime() + 7 * 24 * 60 * 60 * 1000;

    await this.userService.setRefreshTokenHash(userId, {
      refreshTokenHash,
      refreshTokenExpiresAt,
    });

    return refreshToken;
  }

  decodeToken(token: string) {
    // const tokenString = token.split(' ')[1];
    const decodeToken = this.wsJwt.decode<tokenInfoI>(token);
    return decodeToken;
  }

  async rotateRefreshToken(userId: string, token: string) {
    const user = await this.userService.findByIdWithTokens(userId);
    if (!user || !user.refreshTokenHash) throw new UnauthorizedException();
    const valid = await bcrypt.compare(token, user.refreshTokenHash);
    if (!valid) {
      await this.userService.setRefreshTokenHash(userId, null);
      throw new UnauthorizedException('Invalid refresh token');
    }
    const newToken = await this.createRefreshTokenForUser(userId);
    return newToken;
  }

  async rotateAccessToken(userId: string, token: string) {
    const user = await this.userService.findByIdWithTokens(userId);
    if (!user || !user.refreshTokenHash) throw new UnauthorizedException();
    await this.validateRefreshToken(user, token);
    const newToken = await this.signAccessToken(user);
    const newTokenWS = await this.signAccessTokenWS(user);
    return { newToken, newTokenWS };
  }

  async clearRefreshToken(userId: string) {
    await this.userService.setRefreshTokenHash(userId, {
      refreshTokenHash: null,
      refreshTokenExpiresAt: null,
    });
  }

  async validateRefreshToken(user: User, token: string) {
    // const user = await this.userService.findById(userId);

    if (!user.refreshTokenHash || !user.refreshTokenExpiresAt) {
      throw new UnauthorizedException('No refresh token');
    }
    console.log('TOKEN', token);
    console.log(' refresh TOKEN', user.refreshTokenHash);
    const isValid = await bcrypt.compare(token, user.refreshTokenHash);
    if (!isValid) {
      // await this.userService.setRefreshTokenHash(userId, null);
      throw new UnauthorizedException('Invalid token');
    }
    if (user.refreshTokenExpiresAt < new Date().getTime())
      throw new UnauthorizedException('Token expired');

    return user;
  }
}
