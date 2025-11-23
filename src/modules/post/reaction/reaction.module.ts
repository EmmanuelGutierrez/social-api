import { Module } from '@nestjs/common';
import { ReactionService } from './reaction.service';
import { ReactionResolver } from './reaction.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { Reaction, ReactionSchema } from './entities/reaction.entity';

@Module({
  providers: [ReactionResolver, ReactionService],
  imports: [
    MongooseModule.forFeature([
      {
        name: Reaction.name,
        schema: ReactionSchema,
      },
    ]),
  ],
  exports: [ReactionService],
})
export class ReactionModule {}
