import { Module } from '@nestjs/common';
import { UsersService } from './application,use-cases/users.service';
import { UsersRepository } from './infrastructure/users.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../../../domains/user.entity';
import { configModule } from '../../../app.module';
import { IsUserAlreadyExistConstraint } from '../../../decorators/IsUserAlreadyExist';

@Module({
  imports: [
    configModule,

    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [UsersService, UsersRepository, IsUserAlreadyExistConstraint],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
