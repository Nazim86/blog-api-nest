import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../../superadmin/users/users.module';
import { AuthService } from './auth.service';
import { AccessTokenStrategy } from './strategies/access-token.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { ConfigModule } from '@nestjs/config';
import { BasicStrategy } from './strategies/basic.strategy';
import { MailModule } from '../../../mail/mail.module';
import { DeviceRepository } from '../securityDevices/device.repository';
import { MailService } from '../../../mail/mail.service';
import { UsersRepository } from '../../superadmin/users/infrastructure/users.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../../superadmin/users/domain/user.entity';
import { JwtService } from '../../../jwt/jwt.service';
import { Device, DeviceSchema } from '../securityDevices/domain/device.entity';
import { DeleteController } from '../../../delete/delete.controller';
import { AuthController } from './api/auth.controller';
import { DeviceService } from '../securityDevices/device.service';
import { UserQueryRepo } from '../../superadmin/users/infrastructure/users.query.repo';
import { Blog, BlogSchema } from '../blogs/domain/blog.entity';
import { Post, PostSchema } from '../post/domain/post.entity';
import { PostLike, PostLikeSchema } from '../like/postLike.entity';
import { CommentLike, CommentLikeSchema } from '../like/commentLike.entity';
import { Comment, CommentSchema } from '../comments/domain/comment.entity';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';
import { UsersService } from '../../superadmin/users/application,use-cases/users.service';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { DevicesController } from '../securityDevices/devices.controller';
import { DeviceQueryRepo } from '../securityDevices/device-query.repo';
import { ScheduleModule } from '@nestjs/schedule';
import { SuperAdminUsersController } from '../../superadmin/users/sa.users.controller';
import { CqrsModule } from '@nestjs/cqrs';

const mongooseModels = [
  { name: Device.name, schema: DeviceSchema },
  { name: Blog.name, schema: BlogSchema },
  { name: Post.name, schema: PostSchema },
  { name: PostLike.name, schema: PostLikeSchema },
  { name: CommentLike.name, schema: CommentLikeSchema },
  { name: Comment.name, schema: CommentSchema },
  { name: User.name, schema: UserSchema },
];
// const useCases = [CreateUsersUseCase];
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
