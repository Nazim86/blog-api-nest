import { Injectable } from '@nestjs/common';
import { PostsQueryRepo } from '../../post/infrastructure/posts-query-repo';
import { PostsViewType } from '../../post/types/posts-view-type';
import { QueryPaginationType } from '../../../../types/query-pagination-type';
import { CommentsViewType } from '../types/comments-view-type';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentDocument } from '../../../../domains/comment.entity';
import { Model } from 'mongoose';
import { CommentsMapping } from '../mapper/comments.mapping';
import {
  CommentLike,
  CommentLikeDocument,
} from '../../../../domains/commentLike.entity';
import { LikeEnum } from '../../like/like.enum';
import { ObjectId } from 'mongodb';
import { UsersRepository } from '../../../superadmin/users/infrastructure/users.repository';

@Injectable()
export class CommentsQueryRepo {
  constructor(
    private readonly postQueryRepo: PostsQueryRepo,
    private readonly commentMapping: CommentsMapping,
    private readonly usersRepository: UsersRepository,

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

  async getComment(commentId: string, userId?: string): Promise<any | null> {
    try {
      const comment: CommentDocument | null = await this.CommentModel.findOne({
        _id: new ObjectId(commentId),
      });

      if (!comment) return null;

      const user = await this.usersRepository.findUserById(
        comment.commentatorInfo.userId,
      );

      if (user.banInfo.isBanned) {
        return null;
      }

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
        id: comment._id.toString(),
        content: comment.content,
        commentatorInfo: {
          userId: comment.commentatorInfo.userId,
          userLogin: comment.commentatorInfo.userLogin,
        },
        createdAt: comment.createdAt,
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
