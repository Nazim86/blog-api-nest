import { Module } from '@nestjs/common';
import { UsersRepository } from '../../infrastructure/users/users.repository';
import { configModule } from '../../../app.module';
import { IsUserAlreadyExistConstraint } from '../../../decorators/IsUserAlreadyExist';
import { BlogRepository } from '../../infrastructure/blogs/blog.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from '../../entities/users/user.entity';
import { UsersBanBySa } from '../../entities/users/users-ban-by-sa.entity';
import { Devices } from '../../entities/devices/devices.entity';
import { Blogs } from '../../entities/blogs/blogs.entity';
import { EmailConfirmation } from '../../entities/users/email-confirmation.entity';
import { PasswordRecovery } from '../../entities/users/password-recovery.entity';
import { UsersBanByBlogger } from '../../entities/users/usersBanByBlogger.entity';
import { BlogBanInfo } from '../../entities/blogs/blogBanInfo.entity';
import { BlogWallpaperImage } from '../../entities/blogs/blogWallpaperImage.entity';
import { BlogMainImage } from '../../entities/blogs/blogMainImage.entity';

@Module({
  imports: [
    configModule,
    TypeOrmModule.forFeature([
      Users,
      UsersBanBySa,
      Devices,
      Blogs,
      EmailConfirmation,
      PasswordRecovery,
      UsersBanByBlogger,
      BlogBanInfo,
      BlogWallpaperImage, // TODO: why this need to be
      BlogMainImage, // TODO: why this need to be
    ]),
  ],
  providers: [UsersRepository, IsUserAlreadyExistConstraint, BlogRepository],
  exports: [UsersRepository, BlogRepository],
})
export class UsersModule {}
