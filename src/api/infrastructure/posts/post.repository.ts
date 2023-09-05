import { Injectable } from '@nestjs/common';
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

      return post;
    } catch (e) {
      return null;
    }
  }

  async deletePostById(id: string): Promise<boolean> {
    try {
      const result = await this.postsRepo
        .createQueryBuilder()
        .delete()
        .from(Posts)
        .where('id = :id', { id: id })
        .execute();

      return result.affected === 1;
    } catch (e) {
      return false;
    }
  }
}
