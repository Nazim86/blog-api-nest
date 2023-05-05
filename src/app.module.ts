import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './blogs/blog.entity';
import { BlogController } from './blogs/blog.controller';
import { BlogQueryRepo } from './blogs/blog.queryRepo';
import { Post, PostEntity } from './post/post.entity';
import { PostMapping } from './post/mapper/post.mapping';
import { PostsQueryRepo } from './post/posts-query-repo';
import { PostLike, PostLikeSchema } from './like/post.like.schema';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/blogApiNest'),
    MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
    MongooseModule.forFeature([{ name: Post.name, schema: PostEntity }]),
    MongooseModule.forFeature([
      { name: PostLike.name, schema: PostLikeSchema },
    ]),
  ],

  controllers: [AppController, BlogController],
  providers: [AppService, BlogQueryRepo, PostsQueryRepo, PostMapping],
})
export class AppModule {}
