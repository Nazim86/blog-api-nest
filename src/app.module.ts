import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
export const configModule = ConfigModule.forRoot();
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './api/public/blogs/domain/blog.entity';
import { BloggerController } from './api/blogger/blogger.controller';
import { BlogsQueryRepo } from './api/public/blogs/infrastructure/blogs-query.repository';
import { Post, PostSchema } from './domains/post.entity';
import { PostMapping } from './api/public/post/mapper/post.mapping';
import { PostsQueryRepo } from './api/public/post/infrastructure/posts-query-repo';
import { PostLike, PostLikeSchema } from './domains/postLike.entity';
import { BlogRepository } from './api/public/blogs/infrastructure/blog.repository';
import { PostsController } from './api/public/post/api/posts.controller';
import { PostService } from './api/public/post/application/posts.service';
import { PostRepository } from './api/public/post/infrastructure/post.repository';
import { CommentLike, CommentLikeSchema } from './domains/commentLike.entity';
import { CommentsQueryRepo } from './api/public/comments/infrastructure/comments.query.repo';
import { CommentsMapping } from './api/public/comments/mapper/comments.mapping';
import { Comment, CommentSchema } from './domains/comment.entity';
import { UsersService } from './api/superadmin/users/application,use-cases/users.service';
import { UserQueryRepo } from './api/superadmin/users/infrastructure/users.query.repo';
import { UsersRepository } from './api/superadmin/users/infrastructure/users.repository';
import { User, UserSchema } from './domains/user.entity';
import { DeleteController } from './delete/delete.controller';

import * as process from 'process';
import { AuthModule } from './api/public/auth/auth.module';
import { UsersModule } from './api/superadmin/users/users.module';
import { LikesRepository } from './api/public/like/likes.repository';
import { CommentsRepository } from './api/public/comments/infrastructure/comments.repository';
import { MailModule } from './mail/mail.module';
import { JwtService } from './jwt/jwt.service';
import { CommentsController } from './api/public/comments/api/comments.controller';
import { IsBlogExistConstraint } from './decorators/IsBlogIdExist';
import { ScheduleModule } from '@nestjs/schedule';
import { DeviceRepository } from './api/public/securityDevices/infrastructure/device.repository';
import { Device, DeviceSchema } from './domains/device.entity';
import { SuperAdminBlogsController } from './api/superadmin/blogs/sa.blogs.controller';
import { BlogCreateUseCase } from './api/blogger/application,use-cases/blog-create-use-case';
import { CqrsModule } from '@nestjs/cqrs';
import { BlogUpdateUseCase } from './api/blogger/application,use-cases/blog-update-use-case';
import { BindBlogUseCase } from './api/superadmin/blogs/bind-blog-use-case';
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

const mongooseModels = [
  { name: Device.name, schema: DeviceSchema },
  { name: Blog.name, schema: BlogSchema },
  { name: Post.name, schema: PostSchema },
  { name: PostLike.name, schema: PostLikeSchema },
  { name: CommentLike.name, schema: CommentLikeSchema },
  { name: Comment.name, schema: CommentSchema },
  { name: User.name, schema: UserSchema },
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
];
@Module({
  imports: [
    configModule,
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    MongooseModule.forRoot(process.env.MONGOOSE_URL),
    MongooseModule.forFeature(mongooseModels),
    MailModule,
    CqrsModule,
  ],

  controllers: [
    AppController,
    BloggerController,
    PostsController,
    SuperAdminUsersController,
    DeleteController,
    CommentsController,
    SuperAdminBlogsController,
    SuperAdminUsersController,
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
    UsersService,
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
