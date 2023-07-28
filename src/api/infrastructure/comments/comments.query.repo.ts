import { Injectable } from '@nestjs/common';
import { PostsQueryRepo } from '../posts/posts-query-repo';
import { QueryPaginationType } from '../../../types/query-pagination-type';
import { CommentsViewType } from './types/comments-view-type';
import { CommentsMapping } from '../../public/comments/mapper/comments.mapping';
import { LikeEnum } from '../../public/like/like.enum';
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
    private readonly commentMapping: CommentsMapping,
    private readonly usersRepository: UsersRepository,
    private readonly blogsRepository: BlogRepository,
    private readonly postsRepository: PostRepository,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  private async commentMappingForBlogger(comments, myStatus: string) {
    return Promise.all(
      comments.map(async (comment) => {
        const commentLike = await this.dataSource.query(
          `Select * from public.comment_like
                  Where "commentId"=$1;`,
          [comment.id],
        );

        if (commentLike.length > 0) {
          myStatus = commentLike.status;
        }

        const likesCount = await this.dataSource.query(
          `Select count(*) from public.comment_like
                  Where "commentId"=$1 and "status"=$2 and "banStatus" = $3;`,
          [comment.id, LikeEnum.Like, false],
        );

        const dislikesCount = await this.dataSource.query(
          `Select count(*) from public.comment_like
                  Where "commentId"=$1 and "status"=$2 and "banStatus" = $3;`,
          [comment.id, LikeEnum.Dislike, false],
        );

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
    ); // this was not here before

    const postById = await this.postsRepository.getPostById(postId);

    if (!postById) return null;

    const skipSize = paginatedQuery.skipSize;

    //const skipSize = (query.pageNumber - 1) * query.pageSize;

    let totalCount = await this.dataSource.query(
      `Select count(*) from public.comments c
            Left join public.users u on
              c."userId"= u."id"
              Where c."postId" = $1`,
      [postId],
    );

    totalCount = Number(totalCount[0].count);

    // const totalCount = await this.CommentModel.countDocuments({
    //   postId: postId,
    // });
    const pagesCount = paginatedQuery.totalPages(totalCount);

    // const pagesCount = Math.ceil(totalCount / query.pageSize);

    const getCommentsForPost = await this.dataSource.query(
      `Select c.*,  u."login" as "userLogin"
              from public.comments c
              Left join public.users u on
              c."userId"= u."id"
              Where c."postId" = $1
              Order by "${paginatedQuery.sortBy}" ${paginatedQuery.sortDirection}
              Limit ${paginatedQuery.pageSize} Offset ${skipSize}`,
      [postId],
    );

    // pi."title",
    //   pi."blogId",pi."blogName", pi."blogOwnerId"

    // Left join public.post_info pi on
    // c."id"= pi."commentId"

    const mappedComment: Promise<CommentsViewType>[] =
      await this.commentMapping.commentMapping(getCommentsForPost, userId);

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
        `Select c.*,  u."login" as "userLogin"
              from public.comments c
              Left join public.users u on
              c."userId"= u."id"
              Where c."id" = $1`,
        [commentId],
      );

      // pi."title",
      //   pi."blogId",pi."blogName", pi."blogOwnerId"

      // Left join public.post_info pi on
      // c."id"= pi."commentId"

      comment = comment[0];

      if (!comment) return null;

      const user = await this.usersRepository.findUserById(comment.userId);

      //console.log('user in getComment in coment query repository', user);

      if (user.isBanned) {
        return null;
      }

      let myStatus = 'None';

      if (userId) {
        const likeInDb = await this.dataSource.query(
          `SELECT * FROM public.comment_like
                 Where "commentId"=$1 and "userId" = $2;`,
          [commentId, userId],
        );

        if (likeInDb.length > 0) {
          myStatus = likeInDb[0].status;
        }
      }

      let likesCount = await this.dataSource.query(
        `SELECT count(*) 
        FROM public.comment_like cl Where cl."commentId"=$1 and cl."status"=$2 and cl."banStatus"=$3;`,
        [comment.id, LikeEnum.Like, false],
      );

      likesCount = Number(likesCount[0].count);

      let dislikesCount = await this.dataSource.query(
        `SELECT count(*) 
        FROM public.comment_like cl Where cl."commentId"=$1 and cl."status"=$2 and cl."banStatus"=$3;`,
        [comment.id, LikeEnum.Dislike, false],
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

    console.log(userId, typeof userId);

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
              p."blogId",p."blogName", b."ownerId" 
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

    //in total we see b."ownerId"=$2 , but in comments as if there was missing check for ownerId so I added it
    // `Select c.*, ci."userId", ci."userLogin", pi."title",
    //           pi."blogId",pi."blogName", pi."blogOwnerId"
    //           from public.comments c
    //           Left join public.commentator_info ci on
    //           c."id"= ci."commentId"
    //           Left join public.post_info pi on
    //           c."id"= pi."commentId"
    //           Where ci."isBanned" = $1 and
    //

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
  }
}
