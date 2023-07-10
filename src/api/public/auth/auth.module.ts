import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../../superadmin/users/users.module';
import { AccessTokenStrategy } from './strategies/access-token.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { ConfigModule } from '@nestjs/config';
import { BasicStrategy } from './strategies/basic.strategy';
import { MailModule } from '../../../mail/mail.module';
import { DeviceRepository } from '../../infrastructure/devices/device.repository';
import { MailService } from '../../../mail/mail.service';
import { UsersRepository } from '../../infrastructure/users/users.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../../entities/user.entity';
import { JwtService } from '../../../jwt/jwt.service';
import { Device, DeviceSchema } from '../../entities/device.entity';
import { DeleteController } from '../../../delete/delete.controller';
import { AuthController } from './api/auth.controller';
import { UserQueryRepo } from '../../infrastructure/users/users.query.repo';
import { Blog, BlogSchema } from '../../entities/blog.entity';
import { Post, PostSchema } from '../../entities/post.entity';
import { PostLike, PostLikeSchema } from '../../entities/postLike.entity';
import {
  CommentLike,
  CommentLikeSchema,
} from '../../entities/commentLike.entity';
import { Comment, CommentSchema } from '../../entities/comment.entity';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';

import { DevicesController } from '../securityDevices/api/devices.controller';
import { DeviceQueryRepo } from '../../infrastructure/devices/device-query.repo';
import { ScheduleModule } from '@nestjs/schedule';
import { SuperAdminUsersController } from '../../superadmin/users/sa.users.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { DeviceCreateUseCase } from '../securityDevices/application,use-cases/device-create-use-case';
import { DeviceUpdateUseCase } from '../securityDevices/application,use-cases/device-update-use-case';
import {
  BloggerBanUser,
  UserBanByBloggerSchema,
} from '../../entities/user-ban-by-blogger.entity';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

const mongooseModels = [
  { name: Device.name, schema: DeviceSchema },
  { name: Blog.name, schema: BlogSchema },
  { name: Post.name, schema: PostSchema },
  { name: PostLike.name, schema: PostLikeSchema },
  { name: CommentLike.name, schema: CommentLikeSchema },
  { name: Comment.name, schema: CommentSchema },
  { name: User.name, schema: UserSchema },
  { name: BloggerBanUser.name, schema: UserBanByBloggerSchema },
];
const useCases = [DeviceCreateUseCase, DeviceUpdateUseCase];
@Module({
  imports: [
    // ThrottlerModule.forRoot({
    //   ttl: 1,
    //   limit: 1000,
    // }),
    ScheduleModule.forRoot(),
    UsersModule,
    PassportModule,
    ConfigModule,
    MongooseModule.forFeature(mongooseModels),
    // TypeOrmModule.forRoot({
    //   type: 'postgres',
    //   host: process.env.PG_HOST, //localhost
    //   //port: 5432,
    //   username: process.env.PG_USER,
    //   password: process.env.PG_PASS,
    //   ssl: true,
    //   database: process.env.PG_DATABASE,
    //   autoLoadEntities: false,
    //   synchronize: false,
    // }),

    // JwtModule.register({
    //   secret: refreshTokenSecret.secret,
    //   signOptions: { expiresIn: '20m' },
    // }), //TODO question why we need JwtModule.register if we set expiration time in controller
    MailModule,
    CqrsModule,
  ],
  providers: [
    LocalStrategy,
    AccessTokenStrategy,
    BasicStrategy,
    DeviceRepository,
    MailService,
    UsersRepository,
    JwtService,
    UserQueryRepo,
    RefreshTokenStrategy,
    DeviceQueryRepo,
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard,
    // },
    ...useCases,
  ],

  controllers: [
    AuthController,
    SuperAdminUsersController,
    DeleteController,
    DevicesController,
  ],
  exports: [],
})
export class AuthModule {}
