import { CommentsViewType } from '../../../infrastructure/comments/types/comments-view-type';
import { InjectModel } from '@nestjs/mongoose';
import {
  CommentLike,
  CommentLikeDocument,
} from '../../../entities/commentLike.entity';
import { Model } from 'mongoose';
import { LikeEnum } from '../../like/like.enum';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export class CommentsMapping {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectModel(CommentLike.name)
    private CommentLikeModel: Model<CommentLikeDocument>,
  ) {}

  //TODO: Question Why there is two promises?
  //TODO: Question Why I cannot change CommentsDbType? When change .map is not recognized
  async commentMapping(array): Promise<Promise<CommentsViewType>[]> {
    return array.map(async (comment): Promise<CommentsViewType> => {
      //const commentId = comment._id.toString();
      let myStatus = 'None';

      if (comment.userId) {
        const likeInDb = await this.dataSource.query(
          `SELECT * FROM public.comment_like
                 Where "commentId"=$1 and "userId" = $2;`,
          [comment.id, comment.userId],
        );

        // const likeInDb = await this.CommentLikeModel.findOne({
        //   commentId,
        //   userId: comment.commentatorInfo.userId,
        // });
        if (likeInDb) {
          myStatus = likeInDb.status;
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

      // const likesCount = await this.CommentLikeModel.countDocuments({
      //   commentId,
      //   status: LikeEnum.Like,
      // });
      // const dislikesCount = await this.CommentLikeModel.countDocuments({
      //   commentId,
      //   status: LikeEnum.Dislike,
      // });

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
