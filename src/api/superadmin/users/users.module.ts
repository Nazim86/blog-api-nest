import { Module } from '@nestjs/common';
import { UsersRepository } from '../../infrastructure/users/users.repository';
import { configModule } from '../../../app.module';
import { IsUserAlreadyExistConstraint } from '../../../decorators/IsUserAlreadyExist';
import { BlogRepository } from '../../infrastructure/blogs/blog.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from '../../entities/users/user.entity';
import { UsersBanBySa } from '../../entities/users/users-ban-by-sa.entity';
import { Devices } from '../../entities/devices/devices.entity';

@Module({
  imports: [
    configModule,
    TypeOrmModule.forFeature([Users, UsersBanBySa, Devices]),
  ],
  providers: [UsersRepository, IsUserAlreadyExistConstraint, BlogRepository],
  exports: [UsersRepository, BlogRepository],
})
export class UsersModule {}
