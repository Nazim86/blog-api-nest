import { Injectable } from '@nestjs/common';
import { PostsQueryRepo } from '../posts/posts-query-repo';
import { PostsViewType } from '../posts/types/posts-view-type';
import { QueryPaginationType } from '../../../types/query-pagination-type';
import { CommentsViewType } from './types/comments-view-type';
import { InjectModel } from '@nestjs/mongoose';
import {
  Comment,
  CommentDocument,
  CommentModelType,
} from '../../entities/comment.entity';
import { CommentsMapping } from '../../public/comments/mapper/comments.mapping';
import {
  CommentLike,
  CommentLikeDocument,
  CommentLikeModelType,
} from '../../entities/commentLike.entity';
import { LikeEnum } from '../../public/like/like.enum';
import { ObjectId } from 'mongodb';
import { UsersRepository } from '../users/users.repository';
import { Pagination, PaginationType } from '../../../common/pagination';
import { BlogRepository } from '../blogs/blog.repository';
import { PostRepository } from '../posts/post.repository';

@Injectable()
export class CommentsQueryRepo {
  constructor(
    private readonly postQueryRepo: PostsQueryRepo,
    private readonly commentMapping: CommentsMapping,
    private readonly usersRepository: UsersRepository,
    private readonly blogsRepository: BlogRepository,
    private readonly postsRepository: PostRepository,

    @InjectModel(Comment.name) private CommentModel: CommentModelType,
    @InjectModel(CommentLike.name)
    private CommentLikeModel: CommentLikeModelType,
  ) {}

  private async commentMappingForBlogger(
    comments: CommentDocument[],
    mystatus: string,
  ) {
    return Promise.all(
      comments.map(async (comment: CommentDocument) => {
        console.log('CommentId', comment.id);
        const commentLike: CommentLikeDocument =
          await this.CommentLikeModel.findOne({
            commentId: comment.id,
          });

        if (commentLike) {
          mystatus = commentLike.status;
        }

        console.log('CommentLike', commentLike);
        const likesCount = await this.CommentLikeModel.countDocuments({
          commentId: comment.id,
          status: LikeEnum.Like,
          banStatus: false,
        });
        const dislikesCount = await this.CommentLikeModel.countDocuments({
          commentId: comment.id,
          status: LikeEnum.Dislike,
          banStatus: false,
        });

        return {
          id: comment.id,
          content: comment.content,
          commentatorInfo: {
            userId: comment.commentatorInfo.userId,
            userLogin: comment.commentatorInfo.userLogin,
          },
          createdAt: comment.createdAt,
          likesInfo: {
            likesCount,
            dislikesCount,
            myStatus: mystatus,
          },
          postInfo: {
            id: comment.postId,
            title: comment.postInfo.title,
            blogId: comment.postInfo.blogId,
            blogName: comment.postInfo.blogName,
          },
        };
      }),
    );
  }

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
        banStatus: false,
      });
      const dislikesCount = await this.CommentLikeModel.countDocuments({
        commentId,
        status: LikeEnum.Dislike,
        banStatus: false,
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

  async getCommentForBlogger(query: PaginationType, userId: string) {
    try {
      const paginatedQuery: Pagination<PaginationType> = new Pagination(
        query.pageNumber,
        query.pageSize,
        query.sortBy,
        query.sortDirection,
      );

      const filter = {
        'commentatorInfo.isBanned': false,
        'postInfo.blogOwnerId': userId,
      };

      const skipSize = paginatedQuery.skipSize;

      const totalCount = await this.CommentModel.countDocuments(filter);
      const pagesCount = paginatedQuery.totalPages(totalCount);

      const comments: CommentDocument[] = await this.CommentModel.find(filter)
        .sort({
          [paginatedQuery.sortBy]:
            paginatedQuery.sortDirection === 'asc' ? 1 : -1,
        })
        .skip(skipSize)
        .limit(paginatedQuery.pageSize);
      //.lean();
      const myStatus = 'None';
      const mappedCommentsForBlog = await this.commentMappingForBlogger(
        comments,
        myStatus,
      );

      return {
        pagesCount: pagesCount,
        page: Number(paginatedQuery.pageNumber),
        pageSize: Number(paginatedQuery.pageSize),
        totalCount: totalCount,
        items: mappedCommentsForBlog,
      };
    } catch (e) {
      console.log(e);
    }
  }
}
