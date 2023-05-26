import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
export const configModule = ConfigModule.forRoot();
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './blogs/domain/blog.entity';
import { BlogController } from './blogs/api/blog.controller';
import { BlogQueryRepo } from './blogs/infrastructure/blog.queryRepo';
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
import { UserController } from './users/api/users.controller';
import { UsersService } from './users/application/users.service';
import { UserQueryRepo } from './users/infrastructure/users.query.repo';
import { UsersRepository } from './users/infrastructure/users.repository';
import { User, UserSchema } from './users/domain/user.entity';
import { DeleteController } from './delete/delete.controller';

import * as process from 'process';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { LikesRepository } from './like/likes.repository';
import { CommentService } from './comments/application/comments.service';
import { CommentsRepository } from './comments/infrastructure/comments.repository';
import { MailModule } from './mail/mail.module';
import { JwtService } from './jwt/jwt.service';
import { CommentsController } from './comments/api/comments.controller';
import { IsBlogExistConstraint } from './decorators/IsBlogIdExist';

@Module({
  imports: [
    configModule,
    AuthModule,
    UsersModule,
    MongooseModule.forRoot(process.env.MONGOOSE_URL),
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
    MailModule,
  ],

  controllers: [
    AppController,
    BlogController,
    PostsController,
    UserController,
    DeleteController,
    CommentsController,
  ],
  providers: [
    AppService,
    BlogService,
    BlogQueryRepo,
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
  ],
})
export class AppModule {}
