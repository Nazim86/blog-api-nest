import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Posts } from '../../entities/posts/posts.entity';
import { PostMainImage } from '../../entities/posts/postMainImage.entity';

@Injectable()
export class PostRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(Posts) private readonly postsRepo: Repository<Posts>,
    @InjectRepository(PostMainImage)
    private readonly postMainImageRepo: Repository<PostMainImage>,
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

  async findImages(postId: string) {
    try {
      const images = await this.postMainImageRepo
        .createQueryBuilder('pmi')
        .where('pmi.post = :postId', { postId: postId })
        .getMany();

      return images;
    } catch (e) {
      return [];
    }
  }

  async saveMainImage(image: PostMainImage) {
    return this.postMainImageRepo.save(image);
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
