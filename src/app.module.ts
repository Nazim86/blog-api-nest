import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
export const configModule = ConfigModule.forRoot();
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './api/entities/blog.entity';
import { BloggerBlogsController } from './api/blogger/blogger.blogs.controller';
import { BlogsQueryRepo } from './api/infrastructure/blogs/blogs-query.repository';
import { Post, PostSchema } from './api/entities/post.entity';
import { PostMapping } from './api/public/post/mapper/post.mapping';
import { PostsQueryRepo } from './api/infrastructure/posts/posts-query-repo';
import { PostLike, PostLikeSchema } from './api/entities/postLike.entity';
import { BlogRepository } from './api/infrastructure/blogs/blog.repository';
import { PostsController } from './api/public/post/api/posts.controller';
import { PostService } from './api/public/post/application/posts.service';
import { PostRepository } from './api/infrastructure/posts/post.repository';
import {
  CommentLike,
  CommentLikeSchema,
} from './api/entities/commentLike.entity';
import { CommentsQueryRepo } from './api/infrastructure/comments/comments.query.repo';
import { CommentsMapping } from './api/public/comments/mapper/comments.mapping';
import { Comment, CommentSchema } from './api/entities/comment.entity';
import { UserQueryRepo } from './api/infrastructure/users/users.query.repo';
import { UsersRepository } from './api/infrastructure/users/users.repository';
import { User, UserSchema } from './api/entities/user.entity';
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
import { Device, DeviceSchema } from './api/entities/device.entity';
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
import {
  BloggerBanUser,
  UserBanByBloggerSchema,
} from './api/entities/user-ban-by-blogger.entity';
import { BanBlogUseCase } from './api/superadmin/blogs/use-cases/ban-blog-use-case';
import { CheckCredentialsUseCase } from './api/public/auth/application,use-cases/check-credentials-use-case';
import { CurrentUserUseCase } from './api/public/auth/application,use-cases/current-user-use-case';
import { ResendEmailUseCase } from './api/public/auth/application,use-cases/resend-email-use-case';
import { SendRecoveryCodeUseCase } from './api/public/auth/application,use-cases/send-recovery-code-use-case';
import { SetNewPasswordUseCase } from './api/public/auth/application,use-cases/set-new-password-use-case';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeleteUserUseCase } from './api/superadmin/users/application,use-cases/delete-user-use-case';
import { CreateUserUseCase } from './api/public/auth/application,use-cases/create-user-use-case';
import { RegistrationConfirmationUseCase } from './api/public/auth/application,use-cases/registration-confirmation-use-case';

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
];
@Module({
  imports: [
    configModule,
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'sa',
      database: 'blog-api-nest-rawSql',
      autoLoadEntities: false,
      synchronize: false,
    }),
    // MongooseModule.forRootAsync({
    //   useFactory: async () => {
    //     const mongoMemoryServer = await MongoMemoryServer.create();
    //     const mongoMemoryServerConnectionString = mongoMemoryServer.getUri();
    //     const mongoServerConnectionString = process.env.MONGOOSE_URL;
    //     return {
    //       uri: mongoMemoryServerConnectionString,
    //     };
    //   },
    // }),
    MongooseModule.forRoot(process.env.MONGOOSE_URL),
    MongooseModule.forFeature(mongooseModels),
    MailModule,
    CqrsModule,
  ],

  // process.env.MONGOOSE_URL

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
    PostService,
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
