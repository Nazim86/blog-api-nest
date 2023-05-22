import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { AccessTokenStrategy } from './strategies/access-token.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { ConfigModule } from '@nestjs/config';
import { BasicStrategy } from './strategies/basic.strategy';
import { MailModule } from '../mail/mail.module';
import { DeviceRepository } from '../securityDevices/device.repository';
import { MailService } from '../mail/mail.service';
import { UsersRepository } from '../users/infrastructure/users.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/domain/user.entity';
import { JwtService } from '../jwt/jwt.service';
import { Device, DeviceSchema } from '../securityDevices/domain/device.entity';
import { UserController } from '../users/api/users.controller';
import { DeleteController } from '../delete/delete.controller';
import { AuthController } from './api/auth.controller';
import { DeviceService } from '../securityDevices/device.service';
import { UserQueryRepo } from '../users/infrastructure/users.query.repo';
import { Blog, BlogSchema } from '../blogs/domain/blog.entity';
import { Post, PostSchema } from '../post/domain/post.entity';
import { PostLike, PostLikeSchema } from '../like/postLike.entity';
import { CommentLike, CommentLikeSchema } from '../like/commentLike.entity';
import { Comment, CommentSchema } from '../comments/comment.entity';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    ConfigModule,
    MongooseModule.forFeature([{ name: Device.name, schema: DeviceSchema }]),
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    MongooseModule.forFeature([
      { name: PostLike.name, schema: PostLikeSchema },
    ]),
    MongooseModule.forFeature([
      { name: CommentLike.name, schema: CommentLikeSchema },
    ]),
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),

    // JwtModule.register({
    //   secret: refreshTokenSecret.secret,
    //   signOptions: { expiresIn: '20m' },
    // }), //TODO question why we need JwtModule.register if we set expiration time in controller
    MailModule,
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
  ],

  controllers: [AuthController, UserController, DeleteController],
  exports: [AuthService],
})
export class AuthModule {}
