import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

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
