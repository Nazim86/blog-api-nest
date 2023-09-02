import { Injectable } from '@nestjs/common';
import { PostsQueryRepo } from '../posts/posts-query-repo';
import { QueryPaginationType } from '../../../types/query-pagination-type';
import { CommentsViewType } from './types/comments-view-type';
import { UsersRepository } from '../users/users.repository';
import { Pagination, PaginationType } from '../../../common/pagination';
import { BlogRepository } from '../blogs/blog.repository';
import { PostRepository } from '../posts/post.repository';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Comments } from '../../entities/comments/comments.entity';
import { CommentLike } from '../../entities/like/commentLike.entity';

@Injectable()
export class CommentsQueryRepo {
  constructor(
    private readonly postQueryRepo: PostsQueryRepo,
    private readonly usersRepository: UsersRepository,
    private readonly blogsRepository: BlogRepository,
    private readonly postsRepository: PostRepository,
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(Comments)
    private readonly comentsRepo: Repository<Comments>,
  ) {}
  private async commentMapping(
    array,
    userId: string,
  ): Promise<CommentsViewType[]> {
    return array.map((comment): CommentsViewType => {
      let myStatus = 'None';

      if (userId && comment.myStatus) {
        myStatus = comment.myStatus;
      }

      return {
        id: comment.c_id,
        content: comment.c_content,
        commentatorInfo: {
          userId: comment.u_id,
          userLogin: comment.u_login,
        },
        createdAt: comment.c_createdAt,
        likesInfo: {
          likesCount: Number(comment.likesCount),
          dislikesCount: Number(comment.dislikesCount),
          myStatus: myStatus,
        },
      };
    });
  }
  private async commentMappingForBlogger(comments, myStatus: string) {
    comments.map(async (comment) => {
      return {
        id: comment.c_id,
        content: comment.c_content,
        commentatorInfo: {
          userId: comment.u_id,
          userLogin: comment.u_login,
        },
        createdAt: comment.c_createdAt,
        likesInfo: {
          likesCount: Number(comment.likesCount),
          dislikesCount: Number(comment.dislikesCount),
          myStatus: myStatus,
        },
        postInfo: {
          id: comment.p_id,
          title: comment.p_title,
          blogId: comment.b_id,
          blogName: comment.b_name,
        },
      };
    });
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

    const post = await this.postsRepository.getPostById(postId);

    if (!post) return null;

    const skipSize = paginatedQuery.skipSize;

    const comments = await this.comentsRepo
      .createQueryBuilder('c')
      .addSelect(
        (qb) =>
          qb
            .select(`count(*)`)
            .from(Comments, 'c')
            .where('c.postId = :postId', { postId: postId }),
        'totalCount',
      )

      .addSelect(
        (qb) =>
          qb
            .select('status')
            .from(CommentLike, 'cl')
            .where('c.id = cl.commentId')
            .andWhere('cl.userId = :userId', { userId: userId }),
        'myStatus',
      )
      .addSelect(
        (qb) =>
          qb
            .select(`count(*)`)
            .from(CommentLike, 'cl')
            .leftJoin('cl.user', 'u')
            .leftJoin('u.banInfo', 'ub')
            .where('cl.commentId = c.id')
            .andWhere(`cl.status = 'Like'`)
            .andWhere('ub.isBanned = false'),
        'likesCount',
      )
      .addSelect(
        (qb) =>
          qb
            .select(`count(*)`)
            .from(CommentLike, 'cl')
            .leftJoin('cl.user', 'u')
            .leftJoin('u.banInfo', 'ub')
            .where('cl.commentId = c.id')
            .andWhere(`cl.status = 'Dislike'`)
            .andWhere('ub.isBanned = false'),
        'dislikesCount',
      )
      .leftJoinAndSelect('c.user', 'u')
      .where('c.postId = :postId', { postId: postId })
      .orderBy(`c.${paginatedQuery.sortBy}`, paginatedQuery.sortDirection)
      .limit(paginatedQuery.pageSize)
      .offset(skipSize)
      .getRawMany();

    //console.log(comments);

    const totalCount = Number(comments[0].totalCount);

    const pagesCount = paginatedQuery.totalPages(totalCount);

    const mappedComment: CommentsViewType[] = await this.commentMapping(
      comments,
      userId,
    );

    return {
      pagesCount: pagesCount,
      page: Number(query.pageNumber),
      pageSize: Number(query.pageSize),
      totalCount: totalCount,
      items: mappedComment,
    };
  }

  async getComment(commentId: string, userId?: string) {
    try {
      const comment = await this.comentsRepo
        .createQueryBuilder('c')
        .addSelect(
          (qb) =>
            qb
              .select('status')
              .from(CommentLike, 'cl')
              .where('c.id = cl.commentId')
              .andWhere('cl.userId = :userId', { userId: userId }),
          'myStatus',
        )
        .addSelect((qb) =>
          qb
            .select(`count(*)`, 'likesCount')
            .from(CommentLike, 'cl')
            .leftJoin('cl.user', 'u')
            .leftJoin('u.banInfo', 'ub')
            .where('cl.commentId = c.id')
            .andWhere(`cl.status = 'Like'`)
            .andWhere('ub.isBanned = false'),
        )
        .addSelect(
          (qb) =>
            qb
              .select(`count(*)`)
              .from(CommentLike, 'cl')
              .leftJoin('cl.user', 'u')
              .leftJoin('u.banInfo', 'ub')
              .where('cl.commentId = c.id')
              .andWhere(`cl.status = 'Dislike'`)
              .andWhere('ub.isBanned = false'),
          'dislikesCount',
        )
        .leftJoinAndSelect('c.user', 'u')
        .where('c.id = :commentId', { commentId: commentId })
        .getRawOne();

      if (!comment) return null;

      const user = await this.usersRepository.findUserById(comment.c_userId);

      //console.log(user);

      if (user.banInfo.isBanned) {
        return null;
      }

      let myStatus = 'None';

      if (userId && comment.myStatus) {
        myStatus = comment.myStatus;
      }

      return {
        id: comment.c_id,
        content: comment.c_content,
        commentatorInfo: {
          userId: user.id,
          userLogin: user.login,
        },
        createdAt: comment.c_createdAt,
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

    const comments = await this.comentsRepo
      .createQueryBuilder('c')
      .addSelect(
        (qb) =>
          qb
            .select(`count(*)`)
            .from(Comments, 'c')
            .leftJoin('c.post', 'p')
            .leftJoin('p.blog', 'b')
            .leftJoin('b.owner', 'u')
            .leftJoin('u.banInfo', 'ub')
            .where('ub.isBanned = false')
            .andWhere('u.id = :userId', { userId: userId }),
        'totalCount',
      )
      .addSelect(
        (qb) =>
          qb
            .select('status')
            .from(CommentLike, 'cl')
            .where('c.id = cl.commentId')
            .andWhere('cl.userId = :userId', { userId: userId }),
        'myStatus',
      )
      .addSelect(
        (qb) =>
          qb
            .select(`count(*)`)
            .from(CommentLike, 'cl')
            .leftJoin('cl.user', 'u')
            .leftJoin('u.banInfo', 'ub')
            .where('cl.commentId = c.id')
            .andWhere(`cl.status = 'Like'`)
            .andWhere('ub.isBanned = false'),
        'likesCount',
      )
      .addSelect(
        (qb) =>
          qb
            .select(`count(*)`)
            .from(CommentLike, 'cl')
            .leftJoin('cl.user', 'u')
            .leftJoin('u.banInfo', 'ub')
            .where('cl.commentId = c.id')
            .andWhere(`cl.status = 'Dislike'`)
            .andWhere('ub.isBanned = false'),
        'dislikesCount',
      )
      .leftJoinAndSelect('c.post', 'p')
      .leftJoinAndSelect('p.blog', 'b')
      .leftJoinAndSelect('b.owner', 'u')
      .leftJoinAndSelect('u.banInfo', 'ub')
      .where('ub.isBanned = false')
      .andWhere('u.id = :userId', { userId: userId })
      .orderBy(`c.${paginatedQuery.sortBy}`, paginatedQuery.sortDirection)
      .limit(paginatedQuery.pageSize)
      .offset(skipSize)
      .getRawMany();

    //console.log(comments);

    const totalCount = Number(comments[0].totalCount);

    const pagesCount = paginatedQuery.totalPages(totalCount);

    const myStatus = 'None';

    const mappedCommentsForBlog = await this.commentMappingForBlogger(
      comments,
      myStatus,
    );

    // console.log(mappedCommentsForBlog);

    return {
      pagesCount: pagesCount,
      page: Number(paginatedQuery.pageNumber),
      pageSize: Number(paginatedQuery.pageSize),
      totalCount: totalCount,
      items: mappedCommentsForBlog,
    };
  }
}
