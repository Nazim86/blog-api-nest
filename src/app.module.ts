import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
export const configModule = ConfigModule.forRoot({ isGlobal: true });
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BloggerBlogsController } from './api/blogger/blogger.blogs.controller';
import { BlogsQueryRepo } from './api/infrastructure/blogs/blogs-query.repository';
import { PostMapping } from './api/public/post/mapper/post.mapping';
import { PostsQueryRepo } from './api/infrastructure/posts/posts-query-repo';
import { BlogRepository } from './api/infrastructure/blogs/blog.repository';
import { PostsController } from './api/public/post/api/posts.controller';
import { PostRepository } from './api/infrastructure/posts/post.repository';
import { CommentsQueryRepo } from './api/infrastructure/comments/comments.query.repo';
import { CommentsMapping } from './api/public/comments/mapper/comments.mapping';
import { UserQueryRepo } from './api/infrastructure/users/users.query.repo';
import { UsersRepository } from './api/infrastructure/users/users.repository';
import { DeleteController } from './delete/delete.controller';
import * as process from 'process';
import { AuthModule } from './api/public/auth/auth.module';
import { UsersModule } from './api/superadmin/users/users.module';
import { LikesRepository } from './api/infrastructure/likes/likes.repository';
import { CommentsRepository } from './api/infrastructure/comments/comments.repository';
import { MailModule } from './mail/mail.module';
import { JwtService } from './jwt/jwt.service';
import { CommentsController } from './api/public/comments/api/comments.controller';
import { IsBlogExistConstraint } from './decorators/IsBlogIdExist';
import { ScheduleModule } from '@nestjs/schedule';
import { DeviceRepository } from './api/infrastructure/devices/device.repository';
import { SuperAdminBlogsController } from './api/superadmin/blogs/sa.blogs.controller';
import { BlogCreateUseCase } from './api/blogger/application,use-cases/blog-create-use-case';
import { CqrsModule } from '@nestjs/cqrs';
import { BlogUpdateUseCase } from './api/blogger/application,use-cases/blog-update-use-case';
import { BindBlogUseCase } from './api/superadmin/blogs/use-cases/bind-blog-use-case';
import { SuperAdminUsersController } from './api/superadmin/users/sa.users.controller';
import { BanUserUseCase } from './api/superadmin/users/application,use-cases/ban-user-use-case';
import { CreateUsersUseCase } from './api/superadmin/users/application,use-cases/create-user-use-case';
import { PostCreateUseCase } from './api/blogger/application,use-cases/post-create-use-case';
import { PostUpdateUseCase } from './api/blogger/application,use-cases/post-update-use-case';
import { BlogDeleteUseCase } from './api/blogger/application,use-cases/blog-delete-use-case';
import { PostDeleteUseCase } from './api/blogger/application,use-cases/post-delete-use-case';
import { DeviceUpdateUseCase } from './api/public/securityDevices/application,use-cases/device-update-use-case';
import { DeviceCreateUseCase } from './api/public/securityDevices/application,use-cases/device-create-use-case';
import { PostLikeUpdateUseCase } from './api/public/like/use-cases/post-like-update-use-case';
import { CommentUpdateUseCase } from './api/public/comments/application,use-cases/comment-update-use-case';
import { CommentCreateUseCase } from './api/public/comments/application,use-cases/comment-create-use-case';
import { CommentDeleteUseCase } from './api/public/comments/application,use-cases/comment-delete-use-case';
import { CommentLikeStatusUpdateUseCase } from './api/public/like/use-cases/comment-like-status-update-use-case';
import { PublicBlogsController } from './api/public/blogs/api/public.blogs.controller';
import { BloggerBanUserUseCase } from './api/blogger/application,use-cases/blogger-ban-user-use-case';
import { BloggerUsersController } from './api/blogger/blogger.users.controller';
import { BanBlogUseCase } from './api/superadmin/blogs/use-cases/ban-blog-use-case';
import { CheckCredentialsUseCase } from './api/public/auth/application,use-cases/check-credentials-use-case';
import { CurrentUserUseCase } from './api/public/auth/application,use-cases/current-user-use-case';
import { ResendEmailUseCase } from './api/public/auth/application,use-cases/resend-email-use-case';
import { SendRecoveryCodeUseCase } from './api/public/auth/application,use-cases/send-recovery-code-use-case';
import { SetNewPasswordUseCase } from './api/public/auth/application,use-cases/set-new-password-use-case';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DeleteUserUseCase } from './api/superadmin/users/application,use-cases/delete-user-use-case';
import { CreateUserUseCase } from './api/public/auth/application,use-cases/create-user-use-case';
import { RegistrationConfirmationUseCase } from './api/public/auth/application,use-cases/registration-confirmation-use-case';
import { DeviceDeleteByIdUseCase } from './api/public/securityDevices/application,use-cases/device-deleteByDeviceId-use-case';
import { DeleteDevicesUseCase } from './api/public/securityDevices/application,use-cases/delete-devices-use-case';
import { UsersBanBySa } from './api/entities/users/users-ban-by-sa.entity';
import { EmailConfirmation } from './api/entities/users/email-confirmation';
import { Users } from './api/entities/users/user.entity';
import { PasswordRecovery } from './api/entities/users/password-recovery';
import { Posts } from './api/entities/posts/posts.entity';
import { CommentLike } from './api/entities/like/commentLike.entity';
import { Comments } from './api/entities/comments/comments.entity';
import { PostLike } from './api/entities/like/postLike.entity';
import { Devices } from './api/entities/devices/devices.entity';
import { Blogs } from './api/entities/blogs/blogs.entity';
import { UsersBanByBlogger } from './api/entities/users/usersBanByBlogger.entity';
import { BlogBanInfo } from './api/entities/blogs/blogBanInfo.entity';

const useCases = [
  BlogCreateUseCase,
  BlogUpdateUseCase,
  BindBlogUseCase,
  BanUserUseCase,
  CreateUsersUseCase,
  PostCreateUseCase,
  PostUpdateUseCase,
  BlogDeleteUseCase,
  PostDeleteUseCase,
  DeviceUpdateUseCase,
  DeviceCreateUseCase,
  PostLikeUpdateUseCase,
  CommentUpdateUseCase,
  CommentCreateUseCase,
  CommentDeleteUseCase,
  CommentLikeStatusUpdateUseCase,
  BloggerBanUserUseCase,
  BanBlogUseCase,
  CheckCredentialsUseCase,
  CurrentUserUseCase,
  ResendEmailUseCase,
  SendRecoveryCodeUseCase,
  SetNewPasswordUseCase,
  DeleteUserUseCase,
  CreateUserUseCase,
  RegistrationConfirmationUseCase,
  DeviceDeleteByIdUseCase,
  DeleteDevicesUseCase,
];

const entities = [
  Users,
  UsersBanBySa,
  EmailConfirmation,
  PasswordRecovery,
  CommentLike,
  PostLike,
  Comments,
  Posts,
  Devices,
  Blogs,
  UsersBanByBlogger,
  BlogBanInfo,
];

export const neonConfigForTypeOrm: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.PG_HOST, //localhost
  //port: 5432,
  username: process.env.PG_USER,
  password: process.env.PG_PASS,
  entities,
  ssl: true,
  database: process.env.PG_DATABASE,
  autoLoadEntities: true,
  synchronize: true,
};

export const localConfigTypeOrm: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'sa',
  database: 'blog-api-nest-rawSql',
  autoLoadEntities: false,
  synchronize: false,
};

@Module({
  imports: [
    configModule,
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    TypeOrmModule.forRoot(neonConfigForTypeOrm),
    TypeOrmModule.forFeature(entities),
    MailModule,
    CqrsModule,
  ],

  controllers: [
    AppController,
    BloggerBlogsController,
    PostsController,
    SuperAdminUsersController,
    DeleteController,
    CommentsController,
    SuperAdminBlogsController,
    SuperAdminUsersController,
    PublicBlogsController,
    BloggerUsersController,
  ],
  providers: [
    AppService,
    BlogsQueryRepo,
    BlogRepository,
    PostsQueryRepo,
    PostMapping,
    PostRepository,
    CommentsQueryRepo,
    CommentsRepository,
    CommentsMapping,
    UserQueryRepo,
    UsersRepository,
    LikesRepository,
    JwtService,
    IsBlogExistConstraint,
    DeviceRepository,
    ...useCases,
  ],
})
export class AppModule {}
