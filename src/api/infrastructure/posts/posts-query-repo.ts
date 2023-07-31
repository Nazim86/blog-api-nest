import { Injectable } from '@nestjs/common';
import { PostsViewType } from './types/posts-view-type';
import { NewestLikesType } from './types/posts-db-type';
import { LikeEnum } from '../../public/like/like.enum';
import { QueryPaginationType } from '../../../types/query-pagination-type';
import { Pagination, PaginationType } from '../../../common/pagination';
import { BlogRepository } from '../blogs/blog.repository';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class PostsQueryRepo {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    private readonly blogsRepository: BlogRepository,
  ) {}

  private async postViewMapping(
    posts,
    myStatus: string,
    newestLikes,
  ): Promise<Promise<PostsViewType>[]> {
    return posts.map(async (post): Promise<PostsViewType> => {
      // let myStatus = 'None';
      //
      // if (userId) {
      //   let likeInDb = await this.dataSource.query(
      //     `SELECT id, "postId", "userId", "addedAt", status, login, "banStatus"
      //       FROM public.post_like pl Where pl."postId"=$1 and pl."userId"=$2;`,
      //     [post.id, userId],
      //   );
      //
      //   likeInDb = likeInDb[0];
      //   if (likeInDb) {
      //     myStatus = likeInDb.status;
      //   }
      // }
      //
      // let likesCount = await this.dataSource.query(
      //   `SELECT count(*)
      //   FROM public.post_like pl Where pl."postId"=$1 and pl."status"=$2 and pl."banStatus"=$3;`,
      //   [post.id, LikeEnum.Like, false],
      // );
      //
      // likesCount = Number(likesCount[0].count);
      //
      // let dislikesCount = await this.dataSource.query(
      //   `SELECT count(*)
      //   FROM public.post_like pl Where pl."postId"=$1 and pl."status"=$2 and pl."banStatus"=$3;`,
      //   [post.id, LikeEnum.Dislike, false],
      // );
      //
      // dislikesCount = Number(dislikesCount[0].count);
      //
      // const sortBy = 'addedAt';
      //
      // const getLast3Likes = await this.dataSource.query(
      //   `SELECT pl.*, u."login"
      //   FROM public.post_like pl
      //   left join public.users u on
      //   u."id" = pl."userId"
      //   Where pl."postId"=$1 and pl."status"=$2 and pl."banStatus"=$3
      //   Group by pl.id, pl."addedAt", u."login"
      //   Order by "${sortBy}" desc
      //   Limit 3;`,
      //   [post.id, LikeEnum.Like, false],
      // );
      //
      // const newestLikes: NewestLikesType[] = await this.newestLikesMapping(
      //   getLast3Likes,
      // );
      return {
        id: post.id,
        title: post.title,
        shortDescription: post.shortDescription,
        content: post.content,
        blogId: post.blogId,
        blogName: post.blogName,
        createdAt: post.createdAt,
        extendedLikesInfo: {
          likesCount: Number(post.likesCount),
          dislikesCount: Number(post.dislikesCount),
          myStatus: myStatus,
          newestLikes: newestLikes,
        },
      };
    });
  }
  private async newestLikesMapping(postLikes) {
    return postLikes.map((like) => {
      return {
        addedAt: like.addedAt,
        userId: like.userId,
        login: like.login,
      };
    });
  }

  async getPostById(postId: string, userId?: string | undefined) {
    try {
      let post = await this.dataSource.query(
        `SELECT *,
               (SELECT status
            FROM public.post_like pl Where pl."postId"=p."id" and pl."userId"=$2) as "myStatus",
        (SELECT count(*) 
        FROM public.post_like pl 
        Where pl."postId"=p."id" and pl."status"='Like' and pl."banStatus"=false) as "likesCount",
        (SELECT count(*) 
        FROM public.post_like pl 
        Where pl."postId"=p."id" and pl."status"='Dislike' and pl."banStatus"=false) as "dislikesCount"
        FROM public.posts p  
        where "id"=$1`,
        [postId, userId],
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

      if (userId && post.myStatus) {
        myStatus = post.myStatus;
      }

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

      const newestLikes: NewestLikesType[] = await this.newestLikesMapping(
        getLast3Likes,
      );

      return {
        id: post.id,
        title: post.title,
        shortDescription: post.shortDescription,
        content: post.content,
        blogId: post.blogId,
        blogName: post.blogName,
        createdAt: post.createdAt,
        extendedLikesInfo: {
          likesCount: Number(post.likesCount),
          dislikesCount: Number(post.dislikesCount),
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

    const sortBy = 'addedAt';

    let myStatus = LikeEnum.None;

    const posts = await this.dataSource.query(
      `SELECT p.*,
             (SELECT status
            FROM public.post_like pl 
            Where pl."postId"=p."id" and pl."userId"=$1) as "myStatus",
            (SELECT count(*) 
        FROM public.post_like pl 
        Where pl."postId"=p."id" and pl."status"='Like' and pl."banStatus"=false) as "likesCount",
        (SELECT count(*) 
        FROM public.post_like pl 
        Where pl."postId"=p."id" and pl."status"='Dislike' and pl."banStatus"=false) as "dislikesCount",
        (SELECT pl.*, u."login"
        FROM public.post_like pl 
        left join public.users u on
        u."id" = pl."userId"
        Where pl."postId"=p."id" and pl."status"='Like' and pl."banStatus"=false
        Group by pl.id, pl."addedAt", u."login"
        Order by "${sortBy}" desc
        Limit 3) as "getLast3Likes"
            FROM public.posts p
              Order by "${paginatedQuery.sortBy}" ${paginatedQuery.sortDirection}
              Limit ${paginatedQuery.pageSize} Offset ${skipSize} ;`,
      [userId],
    );

    if (userId && posts.myStatus) {
      myStatus = posts.myStatus;
    }

    const newestLikes: NewestLikesType[] = await this.newestLikesMapping(
      posts.getLast3Likes,
    );

    const mappedPost: Promise<PostsViewType>[] = await this.postViewMapping(
      posts,
      myStatus,
      newestLikes,
    );

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

    const pagesCount = paginatedQuery.totalPages(totalCount);

    const sortBy = 'addedAt';

    let myStatus = LikeEnum.None;

    const posts = await this.dataSource.query(
      `SELECT p.* 
             (SELECT status
            FROM public.post_like pl 
            Where pl."postId"=p."id" and pl."userId"=$1) as "myStatus",
            (SELECT count(*) 
        FROM public.post_like pl 
        Where pl."postId"=p."id" and pl."status"='Like' and pl."banStatus"=false) as "likesCount",
        (SELECT count(*) 
        FROM public.post_like pl 
        Where pl."postId"=p."id" and pl."status"='Dislike' and pl."banStatus"=false) as "dislikesCount",
        (SELECT pl.*, u."login"
        FROM public.post_like pl 
        left join public.users u on
        u."id" = pl."userId"
        Where pl."postId"=p."id" and pl."status"='Like' and pl."banStatus"=false
        Group by pl.id, pl."addedAt", u."login"
        Order by "${sortBy}" desc
        Limit 3) as "getLast3Likes"

        FROM public.posts p 
              Where p."blogId"=$1 
              Order by "${paginatedQuery.sortBy}" ${paginatedQuery.sortDirection}
              Limit ${paginatedQuery.pageSize} Offset ${skipSize}`,
      [blogId],
    );

    if (posts.length === 0) return false;

    if (userId && posts.myStatus) {
      myStatus = posts.myStatus;
    }

    const newestLikes: NewestLikesType[] = await this.newestLikesMapping(
      posts.getLast3Likes,
    );

    const mappedPost: Promise<PostsViewType>[] = await this.postViewMapping(
      posts,
      myStatus,
      newestLikes,
    );

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
