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

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/blogApiNest'),
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    MongooseModule.forFeature([
      { name: PostLike.name, schema: PostLikeSchema },
    ]),
    MongooseModule.forFeature([
      { name: CommentLike.name, schema: CommentLikeSchema },
    ]),
    MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
  ],

  controllers: [AppController, BlogController, PostsController],
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
  ],
})
export class AppModule {}
