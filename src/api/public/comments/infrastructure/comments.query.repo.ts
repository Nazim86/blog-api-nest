import { Injectable } from '@nestjs/common';
import { PostsQueryRepo } from '../../post/infrastructure/posts-query-repo';
import { PostsViewType } from '../../post/types/posts-view-type';
import { QueryPaginationType } from '../../../../types/query-pagination-type';
import { CommentsViewType } from '../types/comments-view-type';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentDocument } from '../domain/comment.entity';
import { Model } from 'mongoose';
import { CommentsMapping } from '../mapper/comments.mapping';
import {
  CommentLike,
  CommentLikeDocument,
} from '../../like/commentLike.entity';
import { LikeEnum } from '../../like/like.enum';
import { ObjectId } from 'mongodb';

@Injectable()
export class CommentsQueryRepo {
  constructor(
    protected postQueryRepo: PostsQueryRepo,
    protected commentMapping: CommentsMapping,
    @InjectModel(Comment.name) private CommentModel: Model<CommentDocument>,
    @InjectModel(CommentLike.name)
    private CommentLikeModel: Model<CommentLikeDocument>,
  ) {}

  async getCommentsForPost(
    postId: string,
    query,
  ): Promise<QueryPaginationType<CommentsViewType[]> | null> {
    const postById: PostsViewType | boolean =
      await this.postQueryRepo.getPostById(postId);
    if (!postById) return null;
    const skipSize = (query.pageNumber - 1) * query.pageSize;
    const totalCount = await this.CommentModel.countDocuments({
      postId: postId,
    });
    const pagesCount = Math.ceil(totalCount / query.pageSize);

    const getCommentsForPost: CommentDocument[] = await this.CommentModel.find({
      postId: postId,
    })
      .sort({ [query.sortBy]: query.sortDirection === 'asc' ? 1 : -1 })
      .skip(skipSize)
      .limit(query.pageSize)
      .lean();

    const mappedComment: Promise<CommentsViewType>[] =
      await this.commentMapping.commentMapping(getCommentsForPost);

    const resolvedComments: CommentsViewType[] = await Promise.all(
      mappedComment,
    );

    return {
      pagesCount: pagesCount,
      page: Number(query.pageNumber),
      pageSize: Number(query.pageSize),
      totalCount: totalCount,
      items: resolvedComments,
    };
  }

  async getComment(
    commentId: string,
    userId?: string,
  ): Promise<CommentsViewType | null> {
    try {
      const getComment: CommentDocument | null =
        await this.CommentModel.findOne({
          _id: new ObjectId(commentId),
        });

      if (!getComment) return null;

      let myStatus = 'None';
      if (userId) {
        const likeInDb = await this.CommentLikeModel.findOne({
          commentId,
          userId,
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
        id: getComment._id.toString(),
        content: getComment.content,
        commentatorInfo: {
          userId: getComment.commentatorInfo.userId,
          userLogin: getComment.commentatorInfo.userLogin,
        },
        createdAt: getComment.createdAt,
        likesInfo: {
          likesCount,
          dislikesCount,
          myStatus: myStatus,
        },
      };
    } catch (e) {
      return null;
    }
  }
}
