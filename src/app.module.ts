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
import { Comment, CommentSchema } from './comments/comment.entity';
import { UserController } from './users/api/users.controller';
import { UserService } from './users/application/users.service';
import { UserQueryRepo } from './users/infrastructure/users.query.repo';
import { UserRepository } from './users/infrastructure/users.repository';
import { User, UserSchema } from './users/domain/user.entity';
import { DeleteController } from './delete/delete.controller';

import * as process from 'process';

@Module({
  imports: [
    configModule,
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
  ],

  controllers: [
    AppController,
    BlogController,
    PostsController,
    UserController,
    DeleteController,
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
    CommentsQueryRepo,
    CommentsMapping,
    UserService,
    UserQueryRepo,
    UserRepository,
  ],
})
export class AppModule {}
