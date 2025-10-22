import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(private userService: UserService, private jwt: JwtService) {}

  async register(email: string, password: string) {
    const hash: string = await bcrypt.hash(password, 12);
    return this.userService.createUser(email, hash);
  }

  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new UnauthorizedException();
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new UnauthorizedException();
    return user;
  }

  async signAccessToken(user: any) {
    return this.jwt.sign({ sub: user._id, email: user.email });
  }

  async createRefreshTokenForUser(userId: string) {
    const token = crypto.randomBytes(64).toString('hex');
    const hash: string = await bcrypt.hash(token, 12);
    await this.userService.setRefreshTokenHash(userId, hash);
    return token;
  }

  async rotateRefreshToken(userId: string, token: string) {
    const user = await this.userService.findById(userId);
    if (!user || !user.refreshTokenHash) throw new UnauthorizedException();
    const valid = await bcrypt.compare(token, user.refreshTokenHash);
    if (!valid) throw new UnauthorizedException('Invalid refresh token');
    const newToken = await this.createRefreshTokenForUser(userId);
    return newToken;
  }
}
