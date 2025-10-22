import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findByEmail(email: string) {
    const res = await this.userModel.findOne({ email });
    if (!res) {
      throw new NotFoundException('user not found');
    }
    return res;
  }

  async findById(id: string) {
    const res = this.userModel.findById(id).exec();
    if (!res) {
      throw new NotFoundException('not found');
    }
    return res;
  }

  async createUser(email: string, passwordHash: string) {
    const user = new this.userModel({ email, passwordHash });
    return user.save();
  }

  async setRefreshTokenHash(userId: string, hash: string | null) {
    return this.userModel.findByIdAndUpdate(userId, { refreshTokenHash: hash });
  }
}
