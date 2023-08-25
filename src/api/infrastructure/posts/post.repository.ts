import { Injectable } from '@nestjs/common';
import { CreatePostDto } from '../../public/post/createPostDto';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Posts } from '../../entities/posts/posts.entity';

@Injectable()
export class PostRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(Posts) private readonly postsRepo: Repository<Posts>,
  ) {}

  async savePost(post: Posts) {
    return this.postsRepo.save(post);
  }
  async getPostById(postId: string) {
    try {
      const post = await this.postsRepo
        .createQueryBuilder('p')
        .leftJoinAndSelect('p.blog', 'b')
        .where('p.id = :postId', { postId: postId })
        .getOne();

      //   await this.dataSource.query(
      //   `SELECT * FROM public.posts where "id"=$1`,
      //   [postId],
      // );

      // post = post[0];

      return post;
    } catch (e) {
      return null;
    }
  }

  // async updatePost(updatePostDto: CreatePostDto, postId: string) {
  //   const result = await this.dataSource.query(
  //     `UPDATE public.posts
  //       SET  title=$1, "shortDescription"=$2, content=$3
  //       WHERE "id"=$4;`,
  //     [
  //       updatePostDto.title,
  //       updatePostDto.shortDescription,
  //       updatePostDto.content,
  //       postId,
  //     ],
  //   );
  //   return result[1] === 1;
  // }

  // async createPost(createPostDto: CreatePostDto, blog) {
  //   const newPost = await this.postsRepo.createQueryBuilder('p').
  //
  //   //   .query(
  //   //   `INSERT INTO public.posts(
  //   //      title, "shortDescription", content, "blogId", "blogName", "createdAt")
  //   //     VALUES ( $1, $2, $3, $4, $5, $6) returning id;`,
  //   //   [
  //   //     createPostDto.title,
  //   //     createPostDto.shortDescription,
  //   //     createPostDto.content,
  //   //     blog.id,
  //   //     blog.name,
  //   //     new Date().toISOString(),
  //   //   ],
  //   // );
  //   return newPost[0].id;
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
