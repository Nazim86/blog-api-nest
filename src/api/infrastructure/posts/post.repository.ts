import { Injectable } from '@nestjs/common';
import { CreatePostDto } from '../../public/post/createPostDto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class PostRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}
  async getPostById(postId: string) {
    try {
      let post = await this.dataSource.query(
        `SELECT * FROM public.posts where "id"=$1`,
        [postId],
      );

      post = post[0];

      //return this.PostModel.findOne({ _id: new ObjectId(postId) });

      return post;
    } catch (e) {
      return null;
    }
  }

  async updatePost(updatePostDto: CreatePostDto, postId: string) {
    const result = await this.dataSource.query(
      `UPDATE public.posts 
        SET  title=$1, "shortDescription"=$2, content=$3
        WHERE "id"=$4;`,
      [
        updatePostDto.title,
        updatePostDto.shortDescription,
        updatePostDto.content,
        postId,
      ],
    );
    return result[1] === 1;
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

  // async save(post: PostDocument) {
  //   return post.save();
  // }

  async deletePostById(id: string): Promise<boolean> {
    try {
      const result = await this.dataSource.query(
        `DELETE FROM public.posts WHERE "id"=$1;`,
        [id],
      );
      //const result = await this.PostModel.deleteOne({ _id: new ObjectId(id) });
      return result[1] === 1;
    } catch (e) {
      return false;
    }
  }
}
