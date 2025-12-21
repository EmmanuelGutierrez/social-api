import { Injectable } from '@nestjs/common';
import { FollowUserInput } from './dto/follow.input';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { Follow } from './entities/follow.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class FollowService {
  constructor(@InjectModel(Follow.name) private followModel: Model<Follow>) {}

  async followUser(createFollowInput: FollowUserInput) {
    const follow = await this.followModel.findOneAndUpdate(
      createFollowInput,
      { $setOnInsert: createFollowInput },
      { upsert: true, new: true },
    );
    return follow;
  }

  async getFollowCount(userId: string) {
    return this.followModel.countDocuments({
      follower: new Types.ObjectId(userId),
    });
  }

  async getFollowerCount(userId: string) {
    return this.followModel.countDocuments({
      following: new Types.ObjectId(userId),
    });
  }

  async getFollowing(userId: string, cursor: string, limit: number) {
    const query: FilterQuery<Follow> = { follower: new Types.ObjectId(userId) };
    if (cursor) {
      query._id = {
        $lt: new Types.ObjectId(cursor),
      };
    }
    return this.followModel
      .find(query)
      .limit(limit)
      .populate([
        {
          path: 'follower',
          model: User.name,
          populate: [{ path: 'profileImg', model: File.name }],
        },
        {
          path: 'following',
          model: User.name,
          populate: [{ path: 'profileImg', model: File.name }],
        },
      ]);
  }

  async getFollowers(userId: string, cursor?: string, limit?: number) {
    const query: FilterQuery<Follow> = {
      following: new Types.ObjectId(userId),
    };
    if (cursor) {
      query._id = {
        $lt: new Types.ObjectId(cursor),
      };
    }
    return this.followModel
      .find(query)
      .limit(limit)
      .populate([
        {
          path: 'follower',
          model: User.name,
          populate: [{ path: 'profileImg', model: File.name }],
        },
        {
          path: 'following',
          model: User.name,
          populate: [{ path: 'profileImg', model: File.name }],
        },
      ]);
  }

  async followingIds(userId: string) {
    return this.followModel
      .find({ follower: new Types.ObjectId(userId) })
      .select('following')
      .distinct('following');
  }
  async isFollowing(userId: string, userToFollowId: string) {
    return this.followModel.exists({
      follower: new Types.ObjectId(userId),
      following: new Types.ObjectId(userToFollowId),
    });
  }

  async unfollowUser(createFollowInput: FollowUserInput) {
    return this.followModel.deleteOne(createFollowInput);
  }
}
