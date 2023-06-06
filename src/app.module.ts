import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
export const configModule = ConfigModule.forRoot();
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './blogs/domain/blog.entity';
import { BlogController } from './blogs/api/blog.controller';
import { BlogsQueryRepo } from './blogs/infrastructure/blogs-query.repository';
import { Post, PostSchema } from './post/domain/post.entity';
import { PostMapping } from './post/mapper/post.mapping';
import { PostsQueryRepo } from './post/infrastructure/posts-query-repo';
import { PostLike, PostLikeSchema } from './like/postLike.entity';
import { BlogService } from './blogs/application/blog.service';
import { BlogRepository } from './blogs/infrastructure/blog.repository';
import { PostsController } from './post/api/posts.controller';
import { PostService } from './post/application/posts.service';
import { PostRepository } from './post/infrastructure/post.repository';
import { CommentLike, CommentLikeSchema } from './like/commentLike.entity';
import { CommentsQueryRepo } from './comments/infrastructure/comments.query.repo';
import { CommentsMapping } from './comments/mapper/comments.mapping';
import { Comment, CommentSchema } from './comments/domain/comment.entity';
import { UsersService } from './api/superadmin/users/application&use-cases/users.service';
import { UserQueryRepo } from './api/superadmin/users/infrastructure/users.query.repo';
import { UsersRepository } from './api/superadmin/users/infrastructure/users.repository';
import { User, UserSchema } from './api/superadmin/users/domain/user.entity';
import { DeleteController } from './delete/delete.controller';

import * as process from 'process';
import { AuthModule } from './api/public/auth/auth.module';
import { UsersModule } from './api/superadmin/users/users.module';
import { LikesRepository } from './like/likes.repository';
import { CommentService } from './comments/application/comments.service';
import { CommentsRepository } from './comments/infrastructure/comments.repository';
import { MailModule } from './mail/mail.module';
import { JwtService } from './jwt/jwt.service';
import { CommentsController } from './comments/api/comments.controller';
import { IsBlogExistConstraint } from './decorators/IsBlogIdExist';
import { ScheduleModule } from '@nestjs/schedule';
import { DeviceRepository } from './securityDevices/device.repository';
import { Device, DeviceSchema } from './securityDevices/domain/device.entity';
import { SuperAdminBlogsController } from './api/superadmin/blogs/sa.blogs.controller';
import { BlogCreateUseCase } from './blogs/use-cases/blog-create-use-case';
import { CqrsModule } from '@nestjs/cqrs';
import { BlogUpdateUseCase } from './blogs/use-cases/blog-update-use-case';
import { BindBlogUseCase } from './api/superadmin/blogs/bind-blog-use-case';
import { SuperAdminUsersController } from './api/superadmin/users/sa.users.controller';
import { BanUserUseCase } from './api/superadmin/users/application&use-cases/ban-user-use-case';
import { CreateUsersUseCase } from './api/superadmin/users/application&use-cases/create-user-use-case';

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
    BlogController,
    PostsController,
    SuperAdminUsersController,
    DeleteController,
    CommentsController,
    SuperAdminBlogsController,
    SuperAdminUsersController,
  ],
  providers: [
    AppService,
    BlogService,
    BlogsQueryRepo,
    BlogRepository,
    PostsQueryRepo,
    PostMapping,
    PostService,
    PostRepository,
    CommentService,
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
