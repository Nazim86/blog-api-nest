import { Module } from '@nestjs/common';
import { UsersRepository } from '../../infrastructure/users/users.repository';
import { configModule } from '../../../app.module';
import { IsUserAlreadyExistConstraint } from '../../../decorators/IsUserAlreadyExist';

import { BlogRepository } from '../../infrastructure/blogs/blog.repository';

@Module({
  imports: [configModule],
  providers: [UsersRepository, IsUserAlreadyExistConstraint, BlogRepository],
  exports: [UsersRepository, BlogRepository],
})
export class UsersModule {}
