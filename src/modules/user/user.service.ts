import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { FileUpload } from 'graphql-upload/processRequest.mjs';
import { FileService } from '../file/file.service';
import { File } from '../file/entities/file.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private fileService: FileService,
  ) {}

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

  async findByIdWithTokens(id: string) {
    const user = await this.userModel
      .findById(id)
      .select(['+password', '+refreshTokenHash', '+refreshTokenExpiresAt']);
    if (!user) {
      throw new NotFoundException('not found');
    }
    return user;
  }

  async findById(id: string) {
    const user = await this.userModel.findById(id).populate([
      {
        path: 'following.user',
        model: User.name,
        populate: {
          path: 'profileImg',
          model: File.name,
        },
      },
      {
        path: 'followers.user',
        model: User.name,
        populate: { path: 'profileImg', model: File.name },
      },
      {
        path: 'profileImg',
        model: File.name,
      },
    ]);
    if (!user) {
      throw new NotFoundException('not found');
    }
    return user;
  }

  async followUser(userId: string, userToFollowId: string) {
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
      const dateNow = new Date().getTime();

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

  async createUser(data: CreateUserInput, filesData?: FileUpload) {
    const user = new this.userModel(data);
    if (filesData) {
      const file = await this.fileService.createGraphQL(
        Promise.resolve(filesData),
        user._id,
        `users/files/profile/${user._id}`,
      );
      user.profileImg = file;
    }
    return user.save();
  }

  async setRefreshTokenHash(
    userId: string,
    data: { refreshTokenHash: string | null; refreshTokenExpiresAt: number },
  ) {
    return this.userModel.findByIdAndUpdate(userId, data);
  }
}
