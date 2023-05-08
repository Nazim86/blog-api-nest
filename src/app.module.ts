import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './blogs/blog.entity';
import { BlogController } from './blogs/blog.controller';
import { BlogQueryRepo } from './blogs/blog.queryRepo';
import { Post, PostSchema } from './post/post.entity';
import { PostMapping } from './post/mapper/post.mapping';
import { PostsQueryRepo } from './post/posts-query-repo';
import { PostLike, PostLikeSchema } from './like/postLike.entity';
import { BlogService } from './blogs/blog.service';
import { BlogRepository } from './blogs/blog.repository';
import { PostsController } from './post/posts.controller';
import { PostService } from './post/posts.service';
import { PostRepository } from './post/post.repository';
import { CommentLike, CommentLikeSchema } from './like/commentLike.entity';
import { CommentsQueryRepo } from './comments/comments.query.repo';
import { CommentsMapping } from './comments/mapper/comments.mapping';
import { Comment, CommentSchema } from './comments/comment.entity';
import { UserController } from './users/users.controller';
import { UserService } from './users/users.service';
import { UserQueryRepo } from './users/users.query.repo';
import { UserRepository } from './users/users.repository';
import { User, UserSchema } from './users/user.entity';
import { DeleteController } from './delete/delete.controller';
import { ConfigModule } from '@nestjs/config';
import * as process from 'process';

@Module({
  imports: [
    ConfigModule.forRoot(),
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
