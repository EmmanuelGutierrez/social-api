import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
    const user = await this.userModel.findById(id).populate([
      {
        path: 'following.user',
        model: User.name,
      },
      {
        path: 'followers.user',
        model: User.name,
      },
    ]);
    if (!user) {
      throw new NotFoundException('not found');
    }
    return user;
  }

  async followUser(userId: string, userToFollowId: string) {
    console.log(userId, userToFollowId);
    if (userId === userToFollowId) {
      throw new BadRequestException('same user');
    }

    const user = await this.findById(userId);
    const userToFollow = await this.findById(userToFollowId);
    console.log('USER', user);
    const followingIndex = user.following.findIndex((f) => {
      return f.user.id === userToFollowId;
    });
    const follwerIndex = userToFollow.followers.findIndex(
      (f) => f.user.id === userId,
    );
    if (followingIndex !== -1 && follwerIndex !== -1) {
      user.following.splice(followingIndex, 1);
      userToFollow.followers.splice(follwerIndex, 1);
      await user.save();
      await userToFollow.save();
      return true;
    } else {
      const dateNow = new Date().getTime() / 1000;

      const res = await this.userModel.bulkWrite([
        {
          updateOne: {
            filter: { _id: userToFollowId },
            update: {
              $push: {
                followers: {
                  user: user,
                  followDate: dateNow,
                },
              },
            },
          },
        },
        {
          updateOne: {
            filter: { _id: userId },
            update: {
              $push: {
                following: {
                  user: userToFollow,
                  followDate: dateNow,
                },
              },
            },
          },
        },
      ]);
      console.log(res);
    }

    return true;
  }

  async createUser(data: CreateUserInput) {
    const user = new this.userModel(data);
    return user.save();
  }

  async setRefreshTokenHash(userId: string, hash: string | null) {
    return this.userModel.findByIdAndUpdate(userId, { refreshTokenHash: hash });
  }
}
