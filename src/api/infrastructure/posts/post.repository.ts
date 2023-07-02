import { ObjectId } from 'mongodb';
import { Post, PostDocument, PostModelType } from '../../entities/post.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { CreatePostDto } from '../../public/post/createPostDto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class PostRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectModel(Post.name) private PostModel: PostModelType,
  ) {}
  async getPostById(postId: string): Promise<PostDocument | null> {
    try {
      return this.PostModel.findOne({ _id: new ObjectId(postId) });
    } catch (e) {
      return null;
    }
  }

  async createPost(createPostDto: CreatePostDto, blog) {
    const newPost = await this.dataSource.query(
      `INSERT INTO public.posts(
         title, "shortDescription", content, "blogId", "blogName", "createdAt")
        VALUES ( $1, $2, $3, $4, $5, $6) returning id;`,
      [
        createPostDto.title,
        createPostDto.shortDescription,
        createPostDto.content,
        blog.id,
        blog.name,
        new Date().toISOString(),
      ],
    );

    return newPost[0].id;
  }

  async save(post: PostDocument) {
    return post.save();
  }

  async deletePostById(id: string): Promise<boolean> {
    try {
      const result = await this.PostModel.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount === 1;
    } catch (e) {
      return false;
    }
  }
}
