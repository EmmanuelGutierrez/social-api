import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.input';
import { FileUpload } from 'graphql-upload/processRequest.mjs';
import { FileService } from '../file/file.service';
import { File } from '../file/entities/file.entity';
import { FollowService } from './follow/follow.service';
import { Follow } from './follow/entities/follow.entity';
import { UserDataReturnDto } from './dto/user-data-return.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private fileService: FileService,
    private followService: FollowService,
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
        path: 'following',
        model: Follow.name,
        populate: [
          {
            path: 'following',
            model: User.name,
            populate: [{ path: 'profileImg', model: File.name }],
          },
        ],
      },
      {
        path: 'followers',
        model: Follow.name,
        populate: [
          {
            path: 'follower',
            model: User.name,
            populate: [{ path: 'profileImg', model: File.name }],
          },
        ],
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

  async findByUsername(
    username: string,
    userId?: string,
  ): Promise<UserDataReturnDto> {
    const user = await this.userModel.findOne({ username }).populate([
      {
        path: 'following',
        model: Follow.name,
        populate: [
          {
            path: 'following',
            model: User.name,
            populate: [{ path: 'profileImg', model: File.name }],
          },
        ],
      },
      {
        path: 'followers',
        model: Follow.name,
        populate: [
          {
            path: 'follower',
            model: User.name,
            populate: [{ path: 'profileImg', model: File.name }],
          },
        ],
      },
      {
        path: 'profileImg',
        model: File.name,
      },
    ]);
    if (!user) {
      throw new NotFoundException('not found');
    }
    const isFollowing = userId
      ? await this.followService.isFollowing(userId, user._id)
      : false;
    return { user, isFollowing: !!isFollowing };
  }

  async followUser(userId: string, userToFollowId: string) {
    if (userId === userToFollowId) {
      throw new BadRequestException('you cannot follow yourself');
    }
    const follow = await this.followService.followUser({
      follower: new Types.ObjectId(userId),
      following: new Types.ObjectId(userToFollowId),
    });

    if (follow.updatedAt === follow.createdAt) {
      await Promise.all([
        this.userModel.findByIdAndUpdate(userId, {
          $inc: { followingCount: 1 },
        }),
        this.userModel.findByIdAndUpdate(userToFollowId, {
          $inc: { followersCount: 1 },
        }),
      ]);
      return true;
    }

    return false;
  }

  async unfollowUser(userId: string, userToUnfollowId: string) {
    if (userId === userToUnfollowId) {
      throw new BadRequestException('you cannot unfollow yourself');
    }
    const follow = await this.followService.unfollowUser({
      follower: new Types.ObjectId(userId),
      following: new Types.ObjectId(userToUnfollowId),
    });

    if (follow.deletedCount) {
      await Promise.all([
        this.userModel.findByIdAndUpdate(userId, {
          $inc: { followingCount: -1 },
        }),
        this.userModel.findByIdAndUpdate(userToUnfollowId, {
          $inc: { followersCount: -1 },
        }),
      ]);
      return true;
    }

    return false;
  }

  async getRandomSuggestedUsers(userId: string, limit = 5) {
    const followingIds = await this.followService.followingIds(userId);
    const followingIdsArray = [...followingIds, new Types.ObjectId(userId)];
    console.log(followingIdsArray);
    const suggestedUsers = await this.userModel.aggregate([
      {
        $match: {
          _id: { $nin: followingIdsArray },
        },
      },
      { $sample: { size: limit } },
      {
        $lookup: {
          from: 'files',
          localField: 'profileImg',
          foreignField: '_id',
          as: 'profileImg',
        },
      },
      {
        $unwind: {
          path: '$profileImg',
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);
    return suggestedUsers;
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
