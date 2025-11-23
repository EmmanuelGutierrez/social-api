import { Resolver } from '@nestjs/graphql';
import { ReactionService } from './reaction.service';
import { Reaction } from './entities/reaction.entity';

@Resolver(() => Reaction)
export class ReactionResolver {
  constructor(private readonly reactionService: ReactionService) {}
}
