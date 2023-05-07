import { Comment, CommentDocument } from '../comment.entity';
import { CommentsViewType } from '../types/comments-view-type';
import { InjectModel } from '@nestjs/mongoose';
import {
  CommentLike,
  CommentLikeDocument,
} from '../../like/commentLike.entity';
import { Model } from 'mongoose';
import { LikeEnum } from '../../like/like.enum';

export class CommentsMapping {
  constructor(
    @InjectModel(CommentLike.name)
    private CommentLikeModel: Model<CommentLikeDocument>,
  ) {}

  //TODO: Question Why there is two promises?
  //TODO: Question Why I cannot change CommentsDbType? When change .map is not recognized
  async commentMapping(
    array: CommentDocument[],
  ): Promise<Promise<CommentsViewType>[]> {
    return array.map(
      async (postComment: CommentDocument): Promise<CommentsViewType> => {
        const commentId = postComment._id.toString();
        let myStatus = 'None';
        if (postComment.commentatorInfo.userId) {
          const likeInDb = await this.CommentLikeModel.findOne({
            commentId,
            userId: postComment.commentatorInfo.userId,
          });
          if (likeInDb) {
            myStatus = likeInDb.status;
          }
        }
        const likesCount = await this.CommentLikeModel.countDocuments({
          commentId,
          status: LikeEnum.Like,
        });
        const dislikesCount = await this.CommentLikeModel.countDocuments({
          commentId,
          status: LikeEnum.Dislike,
        });

        return {
          id: postComment._id.toString(),
          content: postComment.content,
          commentatorInfo: {
            userId: postComment.commentatorInfo.userId,
            userLogin: postComment.commentatorInfo.userLogin,
          },
          createdAt: postComment.createdAt,
          likesInfo: {
            likesCount,
            dislikesCount,
            myStatus: myStatus,
          },
        };
      },
    );
  }
}
