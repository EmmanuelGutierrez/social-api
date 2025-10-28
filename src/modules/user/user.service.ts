import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';

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

  async findByEmailWithPassword(email: string) {
    const res = await this.userModel.findOne({ email }).select('+password');
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

  async createUser(data: CreateUserInput) {
    const user = new this.userModel(data);
    return user.save();
  }

  async setRefreshTokenHash(userId: string, hash: string | null) {
    return this.userModel.findByIdAndUpdate(userId, { refreshTokenHash: hash });
  }
}
