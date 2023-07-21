import { CommentsViewType } from '../../../infrastructure/comments/types/comments-view-type';
import { LikeEnum } from '../../like/like.enum';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export class CommentsMapping {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async commentMapping(
    array,
    userId: string,
  ): Promise<Promise<CommentsViewType>[]> {
    return array.map(async (comment): Promise<CommentsViewType> => {
      let myStatus = 'None';

      if (userId) {
        const likeInDb = await this.dataSource.query(
          `SELECT * FROM public.comment_like
                 Where "commentId"=$1 and "userId" = $2;`,
          [comment.id, userId],
        );

        if (likeInDb.length > 0) {
          myStatus = likeInDb[0].status;
        }
      }

      let likesCount = await this.dataSource.query(
        `SELECT count(*) 
        FROM public.comment_like cl Where cl."commentId"=$1 and cl."status"=$2;`,
        [comment.id, LikeEnum.Like],
      );

      likesCount = Number(likesCount[0].count);

      let dislikesCount = await this.dataSource.query(
        `SELECT count(*) 
        FROM public.comment_like cl Where cl."commentId"=$1 and cl."status"=$2;`,
        [comment.id, LikeEnum.Dislike],
      );

      dislikesCount = Number(dislikesCount[0].count);

      return {
        id: comment.id,
        content: comment.content,
        commentatorInfo: {
          userId: comment.userId,
          userLogin: comment.userLogin,
        },
        createdAt: comment.createdAt,
        likesInfo: {
          likesCount,
          dislikesCount,
          myStatus: myStatus,
        },
      };
    });
  }
}
