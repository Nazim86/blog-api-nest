import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateLikeDto } from '../../public/like/createLikeDto';
import { PostLike } from '../../entities/like/postLike.entity';
import { CommentLike } from '../../entities/like/commentLike.entity';

export class LikesRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(PostLike)
    private readonly postLikeRepo: Repository<PostLike>,
    @InjectRepository(CommentLike)
    private readonly commentLikeRepo: Repository<CommentLike>,
  ) {}

  async savePostLike(postLike: PostLike) {
    return this.postLikeRepo.save(postLike);
  }
  async saveCommentLike(commentLike: CommentLike) {
    return this.commentLikeRepo.save(commentLike);
  }

  async findPostLike(postId: string, userId: string) {
    return await this.postLikeRepo
      .createQueryBuilder('pl')
      .leftJoin('pl.post', 'p')
      .leftJoin('pl.user', 'u')
      .where('p.id = :postId', { postId: postId })
      .andWhere('u.id = :userId', { userId: userId })
      .getOne();
  }

  async findCommentLike(commentId: string, userId: string) {
    return await this.commentLikeRepo
      .createQueryBuilder('cl')
      .leftJoin('cl.comment', 'c')
      .leftJoin('cl.user', 'u')
      .where('c.id = :commentId', { commentId: commentId })
      .andWhere('u.id = :userId', { userId: userId })
      .getOne();
  }
}
