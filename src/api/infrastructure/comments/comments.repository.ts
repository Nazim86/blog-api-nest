import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Comments } from '../../entities/comments/comments.entity';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(Comments)
    private readonly commentsRepo: Repository<Comments>,
  ) {}

  async saveComment(comment: Comments) {
    return this.commentsRepo.save(comment);
  }

  async getComment(commentId) {
    return await this.commentsRepo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.user', 'u')
      .leftJoinAndSelect('c.post', 'p')
      .where('c.postId = p.id')
      .andWhere('c.id = :commentId', { commentId: commentId })
      .getOne();
  }

  async deleteComment(commentId: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `DELETE FROM public.comments
                            WHERE "id" =$1;`,
      [commentId],
    );
    return result[1] === 1;
  }
}
