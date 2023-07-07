import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CreateLikeDto } from '../../public/like/createLikeDto';

export class LikesRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async findPostLike(postId: string, userId: string) {
    const postLike = await this.dataSource.query(
      `Select * from public.post_like
             Where "postId" = $1 and "userId"=$2`,
      [postId, userId],
    );
    //return this.PostLikeModel.findOne({ postId, userId });
    return postLike[0];
  }

  async findCommentLike(commentId: string, userId: string) {
    const commentLike = await this.dataSource.query(
      `Select * from public.comment_like
             Where "commentId" = $1 and "userId"=$2`,
      [commentId, userId],
    );
    return commentLike[0];
    //return this.CommentLikeModel.findOne({ commentId, userId });
  }

  async createPostLike(
    postId: string,
    userId: string,
    createPostLikeDto: CreateLikeDto,
    login: string,
  ) {
    const postLike = await this.dataSource.query(
      `INSERT INTO public.post_like(
             "postId", "userId", "addedAt", status, login, "banStatus")
              VALUES ( $1, $2, $3, $4, $5, $6)
              on conflict ("postId","userId")
              Do Update set status = Excluded.status, "addedAt"=Excluded."addedAt";`,
      [
        postId,
        userId,
        new Date().toISOString(),
        createPostLikeDto.likeStatus,
        login,
        false,
      ],
    );

    return postLike[0];
  }

  async createCommentLike(
    commentId: string,
    userId: string,
    createLikeDto: CreateLikeDto,
  ) {
    const commentLike = await this.dataSource.query(
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
    return commentLike[0];
  }

  async setBanStatusForCommentLike(userId: string, banStatus: boolean) {
    return this.dataSource.query(
      `UPDATE public.comment_like cl
        SET cl."banStatus"=$1
        WHERE cl."userId"=$2;`,
      [banStatus, userId],
    );
    //updateMany({ userId }, { $set: { banStatus: banStatus } });
  }

  async setBanStatusForPostLike(userId: string, banStatus: boolean) {
    return this.dataSource.query(
      `UPDATE public.post_like pl
    SET pl."banStatus"=$1
    WHERE pl."userId"= $2;`,
      [banStatus, userId],
    );
    // updateMany(
    //   { userId },
    //   { $set: { banStatus: banStatus } },
    // );
  }
}
