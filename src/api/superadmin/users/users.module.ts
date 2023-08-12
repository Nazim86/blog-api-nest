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
import { EmailConfirmation } from '../../entities/users/email-confirmation';
import { PasswordRecovery } from '../../entities/users/password-recovery';
import { UsersBanByBlogger } from '../../entities/users/usersBanByBlogger.entity';

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
    ]),
  ],
  providers: [UsersRepository, IsUserAlreadyExistConstraint, BlogRepository],
  exports: [UsersRepository, BlogRepository],
})
export class UsersModule {}
