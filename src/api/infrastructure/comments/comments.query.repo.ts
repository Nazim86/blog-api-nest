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

        // const commentLike: CommentLikeDocument =
        //   await this.CommentLikeModel.findOne({
        //     commentId: comment.id,
        //   });

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

        // const likesCount = await this.CommentLikeModel.countDocuments({
        //   commentId: comment.id,
        //   status: LikeEnum.Like,
        //   banStatus: false,
        // });
        // const dislikesCount = await this.CommentLikeModel.countDocuments({
        //   commentId: comment.id,
        //   status: LikeEnum.Dislike,
        //   banStatus: false,
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
              Left join public.commentator_info ci on
              c."id"= ci."commentId"
              Left join public.post_info pi on
              c."id"= pi."commentId"
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
      `Select c.*, ci."userId", ci."userLogin", pi."title",
              pi."blogId",pi."blogName", pi."blogOwnerId" 
              from public.comments c
              Left join public.commentator_info ci on
              c."id"= ci."commentId"
              Left join public.post_info pi on
              c."id"= pi."commentId"
              Where c."postId" = $1
              Order by "${paginatedQuery.sortBy}" ${paginatedQuery.sortDirection}
              Limit ${paginatedQuery.pageSize} Offset ${skipSize}`,
      [postId],
    );

    // const getCommentsForPost: CommentDocument[] = await this.CommentModel.find({
    //   postId: postId,
    // })
    //   .sort({ [query.sortBy]: query.sortDirection === 'asc' ? 1 : -1 })
    //   .skip(skipSize)
    //   .limit(query.pageSize)
    //   .lean();

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
        `Select c.*, ci."userId", ci."userLogin", pi."title",
              pi."blogId",pi."blogName", pi."blogOwnerId" 
              from public.comments c
              Left join public.commentator_info ci on
              c."id"= ci."commentId"
              Left join public.post_info pi on
              c."id"= pi."commentId"
              Where c."id" = $1`,
        [commentId],
      );
      // const comment = await this.CommentModel.findOne({
      //   _id: new ObjectId(commentId),
      // });

      comment = comment[0];

      if (!comment) return null;

      const user = await this.usersRepository.findUserById(comment.userId);

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

        console.log('likeInDb in getComment', likeInDb);
        console.log('user id', user.id);

        // const likeInDb = await this.CommentLikeModel.findOne({
        //   commentId,
        //   userId,
        // });

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

      // const likesCount = await this.CommentLikeModel.countDocuments({
      //   commentId,
      //   status: LikeEnum.Like,
      //   banStatus: false,
      // });
      // const dislikesCount = await this.CommentLikeModel.countDocuments({
      //   commentId,
      //   status: LikeEnum.Dislike,
      //   banStatus: false,
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
    } catch (e) {
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

    // const filter = {
    //   'commentatorInfo.isBanned': false,
    //   'postInfo.blogOwnerId': userId,
    // };

    const skipSize = paginatedQuery.skipSize;

    let totalCount = await this.dataSource.query(
      `Select count(*) from public.comments c
              Left join public.commentator_info ci on
              c."id"= ci."commentId"
              Left join public.post_info pi on
              c."id"= pi."commentId"
              Where ci."isBanned" = $1 and pi."blogOwnerId"=$2`,
      [false, userId],
    );

    totalCount = Number(totalCount[0].count);

    //const totalCount = await this.CommentModel.countDocuments(filter);
    const pagesCount = paginatedQuery.totalPages(totalCount);

    const comments = await this.dataSource.query(
      `Select c.*, ci."userId", ci."userLogin", pi."title",
              pi."blogId",pi."blogName", pi."blogOwnerId" 
              from public.comments c
              Left join public.commentator_info ci on
              c."id"= ci."commentId"
              Left join public.post_info pi on
              c."id"= pi."commentId"
              Where ci."isBanned" = $1 and pi."blogOwnerId"=$2
              Order by "${paginatedQuery.sortBy}" ${paginatedQuery.sortDirection}
              Limit ${paginatedQuery.pageSize} Offset ${skipSize}`,
      [false, userId],
    );
    // const comments: CommentDocument[] = await this.CommentModel.find(filter)
    //   .sort({
    //     [paginatedQuery.sortBy]:
    //       paginatedQuery.sortDirection === 'asc' ? 1 : -1,
    //   })
    //   .skip(skipSize)
    //   .limit(paginatedQuery.pageSize);
    // //.lean();
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
