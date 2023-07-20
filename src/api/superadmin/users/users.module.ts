import { Module } from '@nestjs/common';
import { UsersRepository } from '../../infrastructure/users/users.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../../entities/mongoose-schemas/user.entity';
import { configModule } from '../../../app.module';
import { IsUserAlreadyExistConstraint } from '../../../decorators/IsUserAlreadyExist';
import {
  BloggerBanUser,
  UserBanByBloggerSchema,
} from '../../entities/mongoose-schemas/user-ban-by-blogger.entity';
import { BlogRepository } from '../../infrastructure/blogs/blog.repository';
import { Blog, BlogSchema } from '../../entities/mongoose-schemas/blog.entity';

@Module({
  imports: [
    configModule,

    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Blog.name, schema: BlogSchema },
      { name: BloggerBanUser.name, schema: UserBanByBloggerSchema },
    ]),
  ],
  providers: [UsersRepository, IsUserAlreadyExistConstraint, BlogRepository],
  exports: [UsersRepository, BlogRepository],
})
export class UsersModule {}
