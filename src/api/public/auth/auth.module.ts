import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../../superadmin/users/users.module';
import { AuthService } from './auth.service';
import { AccessTokenStrategy } from './strategies/access-token.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { ConfigModule } from '@nestjs/config';
import { BasicStrategy } from './strategies/basic.strategy';
import { MailModule } from '../../../mail/mail.module';
import { DeviceRepository } from '../securityDevices/infrastructure/device.repository';
import { MailService } from '../../../mail/mail.service';
import { UsersRepository } from '../../superadmin/users/infrastructure/users.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../../../domains/user.entity';
import { JwtService } from '../../../jwt/jwt.service';
import { Device, DeviceSchema } from '../../../domains/device.entity';
import { DeleteController } from '../../../delete/delete.controller';
import { AuthController } from './api/auth.controller';
import { DeviceService } from '../securityDevices/application,use-cases/device.service';
import { UserQueryRepo } from '../../superadmin/users/infrastructure/users.query.repo';
import { Blog, BlogSchema } from '../../../domains/blog.entity';
import { Post, PostSchema } from '../../../domains/post.entity';
import { PostLike, PostLikeSchema } from '../../../domains/postLike.entity';
import {
  CommentLike,
  CommentLikeSchema,
} from '../../../domains/commentLike.entity';
import { Comment, CommentSchema } from '../../../domains/comment.entity';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';
import { UsersService } from '../../superadmin/users/application,use-cases/users.service';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { DevicesController } from '../securityDevices/api/devices.controller';
import { DeviceQueryRepo } from '../securityDevices/infrastructure/device-query.repo';
import { ScheduleModule } from '@nestjs/schedule';
import { SuperAdminUsersController } from '../../superadmin/users/sa.users.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { DeviceCreateUseCase } from '../securityDevices/application,use-cases/device-create-use-case';
import { DeviceUpdateUseCase } from '../securityDevices/application,use-cases/device-update-use-case';

const mongooseModels = [
  { name: Device.name, schema: DeviceSchema },
  { name: Blog.name, schema: BlogSchema },
  { name: Post.name, schema: PostSchema },
  { name: PostLike.name, schema: PostLikeSchema },
  { name: CommentLike.name, schema: CommentLikeSchema },
  { name: Comment.name, schema: CommentSchema },
  { name: User.name, schema: UserSchema },
];
const useCases = [DeviceCreateUseCase, DeviceUpdateUseCase];
@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 1,
      limit: 1000,
    }),
    ScheduleModule.forRoot(),
    UsersModule,
    PassportModule,
    ConfigModule,
    MongooseModule.forFeature(mongooseModels),

    // JwtModule.register({
    //   secret: refreshTokenSecret.secret,
    //   signOptions: { expiresIn: '20m' },
    // }), //TODO question why we need JwtModule.register if we set expiration time in controller
    MailModule,
    CqrsModule,
  ],
  providers: [
    AuthService,
    LocalStrategy,
    AccessTokenStrategy,
    BasicStrategy,
    DeviceRepository,
    MailService,
    UsersRepository,
    JwtService,
    DeviceService,
    UserQueryRepo,
    RefreshTokenStrategy,
    UsersService,
    DeviceQueryRepo,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    ...useCases,
  ],

  controllers: [
    AuthController,
    SuperAdminUsersController,
    DeleteController,
    DevicesController,
  ],
  exports: [AuthService],
})
export class AuthModule {}
