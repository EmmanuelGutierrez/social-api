import { Injectable } from '@nestjs/common';
import { ReactionInput } from './dto/reaction.input';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reaction } from './entities/reaction.entity';

@Injectable()
export class ReactionService {
  constructor(
    @InjectModel(Reaction.name)
    private reactionModel: Model<Reaction>,
  ) {}

  async existReaction(data: ReactionInput): Promise<boolean> {
    const reaction = await this.reactionModel.findOne({
      userId: data.userId,
      postId: data.postId,
    });
    return !!reaction;
  }

  async createReaction(data: ReactionInput): Promise<Reaction> {
    const newReaction = new this.reactionModel(data);
    return newReaction.save();
  }

  async removeReaction(data: ReactionInput): Promise<boolean> {
    const result = await this.reactionModel.deleteOne({
      userId: data.userId,
      postId: data.postId,
    });
    return result.deletedCount > 0;
  }

  async getMyReactions(userId: string): Promise<Reaction[]> {
    return this.reactionModel.find({ userId });
  }

  async findReactionsForPosts(
    userId: string,
    postIds: string[],
  ): Promise<Reaction[]> {
    return this.reactionModel.find({
      userId,
      postId: { $in: postIds },
    });
  }
}
