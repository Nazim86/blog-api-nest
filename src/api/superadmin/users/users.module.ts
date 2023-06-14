import { Module } from '@nestjs/common';
import { UsersService } from './application,use-cases/users.service';
import { UsersRepository } from './infrastructure/users.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../../../domains/user.entity';
import { configModule } from '../../../app.module';
import { IsUserAlreadyExistConstraint } from '../../../decorators/IsUserAlreadyExist';
import {
  UserBanByBlogger,
  UserBanByBloggerSchema,
} from '../../../domains/user-ban-by-blogger.entity';

@Module({
  imports: [
    configModule,

    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: UserBanByBlogger.name, schema: UserBanByBloggerSchema },
    ]),
  ],
  providers: [UsersService, UsersRepository, IsUserAlreadyExistConstraint],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
