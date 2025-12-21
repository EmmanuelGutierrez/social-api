import { Module } from '@nestjs/common';
import { UserResolver } from './user.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './entities/user.entity';
import { UserService } from './user.service';
import { FileModule } from '../file/file.module';
import { FollowModule } from './follow/follow.module';

@Module({
  imports: [
    FileModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    FollowModule,
  ],
  providers: [UserResolver, UserService],
  exports: [UserService],
})
export class UserModule {}
