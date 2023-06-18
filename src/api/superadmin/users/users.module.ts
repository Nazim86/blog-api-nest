import { Module } from '@nestjs/common';
import { UsersService } from './application,use-cases/users.service';
import { UsersRepository } from '../../infrastructure/users/users.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../../entities/user.entity';
import { configModule } from '../../../app.module';
import { IsUserAlreadyExistConstraint } from '../../../decorators/IsUserAlreadyExist';
import {
  BloggerBanUser,
  UserBanByBloggerSchema,
} from '../../entities/user-ban-by-blogger.entity';
import { BlogRepository } from '../../infrastructure/blogs/blog.repository';
import { Blog, BlogSchema } from '../../entities/blog.entity';

@Module({
  imports: [
    configModule,

    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Blog.name, schema: BlogSchema },
      { name: BloggerBanUser.name, schema: UserBanByBloggerSchema },
    ]),
  ],
  providers: [
    UsersService,
    UsersRepository,
    IsUserAlreadyExistConstraint,
    BlogRepository,
  ],
  exports: [UsersService, UsersRepository, BlogRepository],
})
export class UsersModule {}
