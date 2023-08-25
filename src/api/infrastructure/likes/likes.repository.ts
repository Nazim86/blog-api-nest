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
    //   await this.dataSource.query(
    //   `Select * from public.post_like
    //          Where "postId" = $1 and "userId"=$2`,
    //   [postId, userId],
    // );
    return await this.postLikeRepo
      .createQueryBuilder('pl')
      .leftJoin('pl.post', 'p')
      .leftJoin('pl.user', 'u')
      .where('p.id = :postId', { postId: postId })
      .andWhere('u.id = :userId', { userId: userId })
      .getOne();
  }

  async findCommentLike(commentId: string, userId: string) {
    //   this.dataSource.query(
    //   `Select * from public.comment_like
    //          Where "commentId" = $1 and "userId"=$2`,
    //   [commentId, userId],
    // );
    return await this.commentLikeRepo
      .createQueryBuilder('cl')
      .leftJoin('cl.comment', 'c')
      .leftJoin('cl.user', 'u')
      .where('c.id = :commentId', { commentId: commentId })
      .andWhere('u.id = :userId', { userId: userId })
      .getOne();
  }

  // async createPostLike(
  //   postId: string,
  //   userId: string,
  //   createPostLikeDto: CreateLikeDto,
  // ) {
  //   const postLike = await this.dataSource.
  //
  //   // query(
  //   //   `INSERT INTO public.post_like(
  //   //          "postId", "userId", "addedAt", status , "user")
  //   //           VALUES ( $1, $2, $3, $4, $5)
  //   //           on conflict ("postId","userId")
  //   //           Do Update set status = Excluded.status, "addedAt"=Excluded."addedAt";`,
  //   //   [
  //   //     postId,
  //   //     userId,
  //   //     new Date().toISOString(),
  //   //     createPostLikeDto.likeStatus,
  //   //     false,
  //   //   ],
  //   // );
  //
  //   return postLike[0];
  // }

  async createCommentLike(
    commentId: string,
    userId: string,
    createLikeDto: CreateLikeDto,
  ) {
    await this.dataSource.query(
      `INSERT INTO public.comment_like(
            "commentId", "userId", "addedAt","status", "banStatus")
              VALUES ( $1, $2, $3, $4, $5)
              on conflict("commentId","userId")
              Do Update Set "status" = Excluded."status", "addedAt" = Excluded."addedAt";`,
      [
        commentId,
        userId,
        new Date().toISOString(),
        createLikeDto.likeStatus,
        false,
      ],
    );

    return true;
  }

  // async setBanStatusForCommentLike(userId: string, banStatus: boolean) {
  //   return this.dataSource.query(
  //     `UPDATE public.comment_like
  //       SET "banStatus"=$1
  //       WHERE "userId"=$2;`,
  //     [banStatus, userId],
  //   );
  // }

  async resetLikeRepository() {
    return this.dataSource.query(`Truncate public.comment_like`);
  }

  // async setBanStatusForPostLike(userId: string, banStatus: boolean) {
  //   return this.dataSource.query(
  //     `UPDATE public.post_like
  //   SET "banStatus"=$1
  //   WHERE "userId"= $2;`,
  //     [banStatus, userId],
  //   );
  // }
}
