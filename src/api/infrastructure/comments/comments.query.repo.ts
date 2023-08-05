import { Injectable } from '@nestjs/common';
import { PostsQueryRepo } from '../posts/posts-query-repo';
import { QueryPaginationType } from '../../../types/query-pagination-type';
import { CommentsViewType } from './types/comments-view-type';
import { UsersRepository } from '../users/users.repository';
import { Pagination, PaginationType } from '../../../common/pagination';
import { BlogRepository } from '../blogs/blog.repository';
import { PostRepository } from '../posts/post.repository';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class CommentsQueryRepo {
  constructor(
    private readonly postQueryRepo: PostsQueryRepo,
    private readonly usersRepository: UsersRepository,
    private readonly blogsRepository: BlogRepository,
    private readonly postsRepository: PostRepository,
    @InjectDataSource() private dataSource: DataSource,
  ) {}
  private async commentMapping(
    array,
    myStatus: string,
  ): Promise<Promise<CommentsViewType>[]> {
    return array.map(async (comment): Promise<CommentsViewType> => {
      return {
        id: comment.id,
        content: comment.content,
        commentatorInfo: {
          userId: comment.userId,
          userLogin: comment.userLogin,
        },
        createdAt: comment.createdAt,
        likesInfo: {
          likesCount: Number(comment.likesCount),
          dislikesCount: Number(comment.dislikesCount),
          myStatus: myStatus,
        },
      };
    });
  }
  private async commentMappingForBlogger(comments, myStatus: string) {
    return Promise.all(
      comments.map(async (comment) => {
        return {
          id: comment.id,
          content: comment.content,
          commentatorInfo: {
            userId: comment.userId,
            userLogin: comment.userLogin,
          },
          createdAt: comment.createdAt,
          likesInfo: {
            likesCount: Number(comment.likesCount),
            dislikesCount: Number(comment.dislikesCount),
            myStatus: myStatus,
          },
          postInfo: {
            id: comment.postId,
            title: comment.title,
            blogId: comment.blogId,
            blogName: comment.blogName,
          },
        };
      }),
    );
  }

  async getCommentsForPost(
    postId: string,
    query,
    userId?: string,
  ): Promise<QueryPaginationType<CommentsViewType[]> | null> {
    const paginatedQuery: Pagination<PaginationType> = new Pagination(
      query.pageNumber,
      query.pageSize,
      query.sortBy,
      query.sortDirection,
    );

    const postById = await this.postsRepository.getPostById(postId);

    if (!postById) return null;

    const skipSize = paginatedQuery.skipSize;

    let totalCount = await this.dataSource.query(
      `Select count(*) from public.comments c
            Left join public.users u on
              c."userId"= u."id"
              Where c."postId" = $1`,
      [postId],
    );

    totalCount = Number(totalCount[0].count);

    const pagesCount = paginatedQuery.totalPages(totalCount);

    const commentsForPost = await this.dataSource.query(
      `Select c.*,  u."login" as "userLogin",
                (Select "status" from public.comment_like
                  Where "commentId"= c."id" and "userId" = $1) as "myStatus",
                  (Select count(*) from public.comment_like
                  Where "commentId"=c."id" and "status"='Like' and "banStatus" = false) as "likesCount",
                  (Select count(*) from public.comment_like
                  Where "commentId" = c."id" and "status"='Dislike' and "banStatus" = false) as "dislikesCount"
              from public.comments c
              Left join public.users u on
              c."userId"= u."id"
              Where c."postId" = $2
              Order by "${paginatedQuery.sortBy}" ${paginatedQuery.sortDirection}
              Limit ${paginatedQuery.pageSize} Offset ${skipSize}`,
      [userId, postId],
    );

    let myStatus = 'None';

    if (userId && commentsForPost.myStatus) {
      myStatus = commentsForPost.myStatus;
    }

    const mappedComment: Promise<CommentsViewType>[] =
      await this.commentMapping(commentsForPost, myStatus);

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

  async getComment(commentId: string, userId?: string) {
    try {
      let comment = await this.dataSource.query(
        `Select c.*,  u."login" as "userLogin",
            (Select "status" from public.comment_like
                  Where "commentId"= c."id" and "userId" = $1) as "myStatus",
                  (Select count(*) from public.comment_like
                  Where "commentId"=c."id" and "status"='Like' and "banStatus" = false) as "likesCount",
                  (Select count(*) from public.comment_like
                  Where "commentId" = c."id" and "status"='Dislike' and "banStatus" = false) as "dislikesCount"
                  from public.comments c
              Left join public.users u on
              c."userId"= u."id"
              Where c."id" = $2`,
        [userId, commentId],
      );

      comment = comment[0];

      if (!comment) return null;

      const user = await this.usersRepository.findUserById(comment.userId);

      if (user.isBanned) {
        return null;
      }

      let myStatus = 'None';

      if (userId && comment.myStatus) {
        myStatus = comment.myStatus;
      }

      return {
        id: comment.id,
        content: comment.content,
        commentatorInfo: {
          userId: comment.userId,
          userLogin: comment.userLogin,
        },
        createdAt: comment.createdAt,
        likesInfo: {
          likesCount: Number(comment.likesCount),
          dislikesCount: Number(comment.dislikesCount),
          myStatus: myStatus,
        },
      };
    } catch (e) {
      console.log('error in getComment in commentsQueryRepo', e);
      return null;
    }
  }

  async getCommentForBlogger(query: PaginationType, userId: string) {
    const paginatedQuery: Pagination<PaginationType> = new Pagination(
      query.pageNumber,
      query.pageSize,
      query.sortBy,
      query.sortDirection,
    );

    const skipSize = paginatedQuery.skipSize;

    let totalCount = await this.dataSource.query(
      `Select count(*) from public.comments c
              Left join public.users u on
              c."userId"= u."id"
              Left join public.users_ban_by_sa ubb on
              u."id" = ubb."userId"
              Left join public.posts p on
              c."postId"= p."id"
              left join public.blogs b on
              b."id" = p."blogId"
              Where ubb."isBanned" = $1 and b."ownerId"=$2`,
      [false, userId],
    );

    totalCount = Number(totalCount[0].count);

    //const totalCount = await this.CommentModel.countDocuments(filter);
    const pagesCount = paginatedQuery.totalPages(totalCount);

    const comments = await this.dataSource.query(
      `Select c.*, u."login" as "userLogin" , p."title",
              p."blogId",p."blogName", b."ownerId",
              (Select "status" from public.comment_like
                  Where "commentId"= c."id") as "myStatus",
                  (Select count(*) from public.comment_like
                  Where "commentId"=c."id" and "status"='Like' and "banStatus" = false) as "likesCount",
                  (Select count(*) from public.comment_like
                  Where "commentId" = c."id" and "status"='Dislike' and "banStatus" = false) as "dislikesCount"
              from public.comments c
              Left join public.users u on
              c."userId"= u."id"
              Left join public.users_ban_by_sa ubb on
              u."id" = ubb."userId"
              Left join public.posts p on
              c."postId"= p."id"
              left join public.blogs b on
              b."id" = p."blogId"
              Where ubb."isBanned" = $1 and b."ownerId"=$2
              Order by "${paginatedQuery.sortBy}" ${paginatedQuery.sortDirection}
              Limit ${paginatedQuery.pageSize} Offset ${skipSize}`,
      [false, userId],
    );

    let myStatus = 'None';

    if (comments.myStatus) {
      myStatus = comments.myStatus;
    }

    const mappedCommentsForBlog = await this.commentMappingForBlogger(
      comments,
      myStatus,
    );

    console.log(mappedCommentsForBlog);

    return {
      pagesCount: pagesCount,
      page: Number(paginatedQuery.pageNumber),
      pageSize: Number(paginatedQuery.pageSize),
      totalCount: totalCount,
      items: mappedCommentsForBlog,
    };
  }
}
