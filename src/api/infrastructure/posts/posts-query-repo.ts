import { Injectable } from '@nestjs/common';
import { PostsViewType } from './types/posts-view-type';
import { NewestLikesType } from './types/posts-db-type';
import { LikeEnum } from '../../public/like/like.enum';
import { QueryPaginationType } from '../../../types/query-pagination-type';
import { newestLikesMapping } from '../../public/like/post-likes.mapping';
import { PostMapping } from '../../public/post/mapper/post.mapping';
import { Pagination, PaginationType } from '../../../common/pagination';
import { BlogRepository } from '../blogs/blog.repository';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class PostsQueryRepo {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    private readonly postMapping: PostMapping,
    private readonly blogsRepository: BlogRepository,
  ) {}

  async getPostById(postId: string, userId?: string | undefined) {
    try {
      let post = await this.dataSource.query(
        `SELECT * FROM public.posts  where "id"=$1`,
        [postId],
      );

      post = post[0];

      if (!post) {
        return false;
      }

      const blog = await this.blogsRepository.getBlogById(post.blogId);
      if (blog.isBanned) {
        return false;
      }

      let myStatus = 'None';

      if (userId) {
        let likeInDb = await this.dataSource.query(
          `SELECT id, "postId", "userId", "addedAt", status, "banStatus"
            FROM public.post_like pl Where pl."postId"=$1 and pl."userId"=$2;`,
          [postId, userId],
        );

        likeInDb = likeInDb[0];

        if (likeInDb) {
          myStatus = likeInDb.status;
        }
      }

      let likesCount = await this.dataSource.query(
        `SELECT count(*) 
        FROM public.post_like pl Where pl."postId"=$1 and pl."status"=$2 and pl."banStatus"=$3;`,
        [post.id, LikeEnum.Like, false],
      );

      likesCount = Number(likesCount[0].count);

      let dislikesCount = await this.dataSource.query(
        `SELECT count(*) 
        FROM public.post_like pl Where pl."postId"=$1 and pl."status"=$2 and pl."banStatus"=$3;`,
        [post.id, LikeEnum.Dislike, false],
      );

      dislikesCount = Number(dislikesCount[0].count);

      const sortBy = 'addedAt';

      const getLast3Likes = await this.dataSource.query(
        `SELECT pl.*, u."login"
        FROM public.post_like pl 
        left join public.users u on
        u."id" = pl."userId"
        Where pl."postId"=$1 and pl."status"=$2 and pl."banStatus"=$3
        Group by pl.id, pl."addedAt", u."login"
        Order by "${sortBy}" desc
        Limit 3;`,
        [post.id, LikeEnum.Like, false],
      );

      const newestLikes: NewestLikesType[] = newestLikesMapping(getLast3Likes);

      return {
        id: post.id,
        title: post.title,
        shortDescription: post.shortDescription,
        content: post.content,
        blogId: post.blogId,
        blogName: post.blogName,
        createdAt: post.createdAt,
        extendedLikesInfo: {
          likesCount,
          dislikesCount,
          myStatus: myStatus,
          newestLikes: newestLikes,
        },
      };
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async getPosts(
    query,
    userId?: string,
  ): Promise<QueryPaginationType<PostsViewType[]>> {
    const paginatedQuery = new Pagination<PaginationType>(
      query.pageNumber,
      query.pageSize,
      query.sortBy,
      query.sortDirection,
    );

    const skipSize = paginatedQuery.skipSize;

    let totalCount = await this.dataSource.query(
      `SELECT count(*) FROM public.posts;`,
    );

    totalCount = Number(totalCount[0].count);

    //const totalCount = await this.PostModel.countDocuments({});
    const pagesCount = paginatedQuery.totalPages(totalCount);

    const getPosts = await this.dataSource.query(
      `SELECT p.* FROM public.posts p
              Order by "${paginatedQuery.sortBy}" ${paginatedQuery.sortDirection}
              Limit ${paginatedQuery.pageSize} Offset ${skipSize} ;`,
    );

    const mappedPost: Promise<PostsViewType>[] =
      await this.postMapping.postViewMapping(getPosts, userId);

    const resolvedMappedPosts: PostsViewType[] = await Promise.all(mappedPost);

    return {
      pagesCount: pagesCount,
      page: Number(paginatedQuery.pageNumber),
      pageSize: Number(paginatedQuery.pageSize),
      totalCount: totalCount,
      items: resolvedMappedPosts,
    };
  }

  async getPostsByBlogId(
    query,
    blogId: string,
    userId?: string,
  ): Promise<QueryPaginationType<PostsViewType[]> | boolean> {
    const paginatedQuery = new Pagination<PaginationType>(
      query.pageNumber,
      query.pageSize,
      query.sortBy,
      query.sortDirection,
    );
    const skipSize = paginatedQuery.skipSize;

    let totalCount = await this.dataSource.query(
      `SELECT count(*) FROM public.posts Where "blogId"=$1 `,
      [blogId],
    );

    totalCount = Number(totalCount[0].count);

    //const totalCount = await this.PostModel.countDocuments({ blogId: blogId });
    const pagesCount = paginatedQuery.totalPages(totalCount);

    const getPostsByBlogId = await this.dataSource.query(
      `SELECT p.* FROM public.posts p 
              Where p."blogId"=$1 
              Order by "${paginatedQuery.sortBy}" ${paginatedQuery.sortDirection}
              Limit ${paginatedQuery.pageSize} Offset ${skipSize}`,
      [blogId],
    );

    if (getPostsByBlogId.length === 0) return false;

    const mappedPost: Promise<PostsViewType>[] =
      await this.postMapping.postViewMapping(getPostsByBlogId, userId);

    const resolvedMappedPosts: PostsViewType[] = await Promise.all(mappedPost);

    return {
      pagesCount: pagesCount,
      page: Number(paginatedQuery.pageNumber),
      pageSize: Number(paginatedQuery.pageSize),
      totalCount: totalCount,
      items: resolvedMappedPosts,
    };
  }
}
