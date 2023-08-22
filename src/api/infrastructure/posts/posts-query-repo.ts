import { Injectable } from '@nestjs/common';
import { PostsViewType } from './types/posts-view-type';
import { LikeEnum } from '../../public/like/like.enum';
import { QueryPaginationType } from '../../../types/query-pagination-type';
import { Pagination, PaginationType } from '../../../common/pagination';
import { BlogRepository } from '../blogs/blog.repository';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Posts } from '../../entities/posts/posts.entity';
import { PostLike } from '../../entities/like/postLike.entity';

@Injectable()
export class PostsQueryRepo {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    private readonly blogsRepository: BlogRepository,
    @InjectRepository(Posts) private readonly postsRepo: Repository<Posts>,
  ) {}

  // async onModuleInit() {
  //   const postId = '0afc9adc-545a-4ab1-8628-1db02dfa709c';
  //   const query = `select jsonb_agg(json_build_object('addedAt',  agg."addedAt", 'userId', agg."userId", 'id', agg.id)
  //                                order by "addedAt" desc) from (select * from post_like where status = 'Like' and "postId" = '${postId}' ORDER BY "addedAt" DESC limit 3) as agg`;
  //   const res = await this.dataSource.query(query);
  //   console.log(res);
  //   console.log(res[0]);
  //   console.log(res[0][0]);
  //   console.log(res);
  //   console.log(res);
  // }

  private async postViewMapping(
    posts,
    userId: string,
    //myStatus: string,
    //newestLikes,
  ): Promise<Promise<PostsViewType>[]> {
    return posts.map(async (post) => {
      let myStatus = LikeEnum.None;

      if (userId && post.myStatus) {
        myStatus = post.myStatus;
      }

      //const sortBy = 'addedAt';

      // const getLast3Likes = await this.dataSource.query(
      //   `SELECT pl.*, u."login"
      //     FROM public.post_like pl
      //     left join public.users u on
      //     u."id" = pl."userId"
      //     Where pl."postId"=$1 and pl."status"=$2 and pl."banStatus"=$3
      //     Group by pl.id, pl."addedAt", u."login"
      //     Order by "${sortBy}" desc
      //     Limit 3;`,
      //   [post.id, LikeEnum.Like, false],
      // );

      // const newestLikes: NewestLikesType[] = await this.newestLikesMapping(
      //   getLast3Likes,
      // );

      return {
        id: post.p_id,
        title: post.p_title,
        shortDescription: post.p_shortDescription,
        content: post.p_content,
        blogId: post.p_blog,
        blogName: post.p_blog.name,
        createdAt: post.p_createdAt,
        extendedLikesInfo: {
          likesCount: Number(post.likesCount),
          dislikesCount: Number(post.dislikesCount),
          myStatus: myStatus,
          newestLikes: post.newestLikes,
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
      const post = await this.postsRepo
        .createQueryBuilder('p')
        .addSelect((qb) =>
          qb
            .select('pl.status', 'myStatus')
            .from(PostLike, 'pl')
            .where('pl.postId = p.id')
            .andWhere('pl.userId = :userId', { userId: userId }),
        )
        .addSelect((qb) =>
          qb
            .select('count(*)', 'likesCount')
            .from(PostLike, 'pl')
            .leftJoin('pl.user', 'u')
            .leftJoin('u.banInfo', 'ub')
            .where('pl.postId = p.id')
            .andWhere('pl.status = :status', { status: 'Like' })
            .andWhere('ub.isBanned = false'),
        )
        .addSelect((qb) =>
          qb
            .select('count(*)', 'dislikesCount')
            .from(PostLike, 'pl')
            .leftJoin('pl.user', 'u')
            .leftJoin('u.banInfo', 'ub')
            .where('pl.postId = p.id')
            .andWhere('pl.status = :status', { status: 'Dislike' })
            .andWhere('ub.isBanned = false'),
        )
        .addSelect(
          (qb) =>
            qb
              .select(
                `jsonb_agg(json_build_object( 'userId', cast(agg.id as varchar), 'login', agg.login)
                 )`,
              )
              .from((qb) => {
                return qb
                  .select(`pl.addedAt, u.id, u.login`)
                  .from(PostLike, 'pl')
                  .leftJoin('pl.user', 'u')
                  .leftJoin('u.banInfo', 'ub')
                  .where('pl.postId = p.id')
                  .andWhere(`pl.status = 'Like'`)
                  .andWhere('ub.isBanned = false')
                  .orderBy('pl."addedAt"', 'DESC')
                  .limit(3);
              }, 'agg'),

          'newestLikes',
        )
        .leftJoinAndSelect('p.blog', 'b')
        .leftJoinAndSelect('b.owner', 'u')
        .leftJoinAndSelect('u.banInfo', 'ub')
        .where('p.id = :postId', { postId: postId })
        .getRawOne();

      // writeSql(post);
      //console.log(post);

      if (!post) {
        return false;
      }

      const blog = await this.blogsRepository.getBlogById(post.p_blog);
      if (blog.blogBanInfo.isBanned) {
        return false;
      }

      let myStatus = 'None';

      if (userId && post.myStatus) {
        myStatus = post.myStatus;
      }

      // const sortBy = 'addedAt';

      // const getLast3Likes = await this.dataSource.query(
      //   `SELECT pl.*, u."login"
      //   FROM public.post_like pl
      //   left join public.users u on
      //   u."id" = pl."userId"
      //   Where pl."postId"=$1 and pl."status"=$2 and pl."banStatus"=$3
      //   Group by pl.id, pl."addedAt", u."login"
      //   Order by "${sortBy}" desc
      //   Limit 3;`,
      //   // @ts-ignore
      //   [post.id, LikeEnum.Like, false],
      // );

      // const newestLikes: NewestLikesType[] = await this.newestLikesMapping(
      //   getLast3Likes,
      // );

      return {
        id: post.p_id,
        title: post.p_title,
        shortDescription: post.p_shortDescription,
        content: post.p_content,
        blogId: post.p_blog,
        blogName: post.p_blog.name,
        createdAt: post.p_createdAt,
        extendedLikesInfo: {
          likesCount: Number(post.likesCount),
          dislikesCount: Number(post.dislikesCount),
          myStatus: myStatus,
          newestLikes: post.newestLikes ?? [],
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

    //const sortBy = 'addedAt';

    const posts = await this.dataSource.query(
      `SELECT p.*,
       (SELECT status
        FROM public.post_like pl 
        WHERE pl."postId" = p."id" AND pl."userId" = $1) as "myStatus",
        (SELECT count(*) 
         FROM public.post_like pl 
         WHERE pl."postId" = p."id" AND pl."status" = 'Like' AND pl."banStatus" = false) as "likesCount",
        (SELECT count(*) 
         FROM public.post_like pl 
         WHERE pl."postId" = p."id" AND pl."status" = 'Dislike' AND pl."banStatus" = false) as "dislikesCount"
            FROM public.posts p
            ORDER BY "${paginatedQuery.sortBy}" ${paginatedQuery.sortDirection}
            LIMIT ${paginatedQuery.pageSize} OFFSET ${skipSize};`,
      [userId],
    );

    const mappedPost: Promise<PostsViewType>[] = await this.postViewMapping(
      posts,
      userId,
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

    // let totalCount = await this.dataSource.query(
    //   `SELECT count(*) FROM public.posts Where "blog"=$1 `,
    //   [blogId],
    // );

    const posts = await this.postsRepo
      .createQueryBuilder('p')
      .addSelect((qb) =>
        qb
          .select('count(*)', 'totalCount')
          .from(Posts, 'p')
          .leftJoin('p.blog', 'b')
          .where('b.id = :blogId', { blogId: blogId }),
      )
      .addSelect((qb) =>
        qb
          .select('pl.status', 'myStatus')
          .from(PostLike, 'pl')
          .where('pl.postId = p.id')
          .andWhere('pl.userId = :userId', { userId: userId }),
      )
      .addSelect(
        (qb) =>
          qb
            .select('count(*)')
            .from(PostLike, 'pl')
            .leftJoinAndSelect('pl.user', 'u')
            .leftJoinAndSelect('u.banInfo', 'ub')
            .where('pl.postId = p.id')
            .andWhere('pl.status = :status', { status: 'Like' })
            .andWhere('ub.isBanned = false'),
        'dislikesCount',
      )
      .addSelect(
        (qb) =>
          qb
            .select('count(*)')

            .from(PostLike, 'pl')
            .leftJoinAndSelect('pl.user', 'u')
            .leftJoinAndSelect('u.banInfo', 'ub')
            .where('pl.postId = p.id')
            .andWhere('pl.status = :status', { status: 'Dislike' })
            .andWhere('ub.isBanned = false'),
        'dislikesCount',
      )
      .addSelect(
        (qb) =>
          qb
            .select(
              `jsonb_agg(json_build_object( 'userId', cast(agg.id as varchar), 'login', agg.login)
                 )`,
            )
            .from((qb) => {
              return qb
                .select(`pl.addedAt, u.id, u.login`)
                .from(PostLike, 'pl')
                .leftJoin('pl.user', 'u')
                .leftJoin('u.banInfo', 'ub')
                .where('pl.postId = p.id')
                .andWhere(`pl.status = 'Like'`)
                .andWhere('ub.isBanned = false')
                .orderBy('pl."addedAt"', 'DESC')
                .limit(3);
            }, 'agg'),

        'newestLikes',
      )
      .leftJoinAndSelect('p.blog', 'b')
      .leftJoinAndSelect('b.owner', 'u')
      .where('b.id = :blogId', { blogId: blogId })
      .orderBy(`p.${paginatedQuery.sortBy}`, paginatedQuery.sortDirection)
      .skip(skipSize)
      .take(paginatedQuery.pageSize)
      .getRawMany();

    // .leftJoinAndSelect('p.blog', 'b')
    //     .leftJoinAndSelect('b.owner', 'u')
    //     .leftJoinAndSelect('u.banInfo', 'ub')
    //     .where('p.id = :postId', { postId: postId })
    console.log(posts);

    // console.log(posts[0][0]);

    //   .query(
    //   `SELECT p.*,
    //          (SELECT status
    //         FROM public.post_like pl
    //         Where pl."postId"=p."id" and pl."userId"=$1) as "myStatus",
    //         (SELECT count(*)
    //     FROM public.post_like pl
    //     Where pl."postId"=p."id" and pl."status"='Like' and pl."banStatus"=false) as "likesCount",
    //     (SELECT count(*)
    //     FROM public.post_like pl
    //     Where pl."postId"=p."id" and pl."status"='Dislike' and pl."banStatus"=false) as "dislikesCount"
    //     FROM public.posts p
    //           Where p."blog"=$2
    //           Order by "${paginatedQuery.sortBy}" ${paginatedQuery.sortDirection}
    //           Limit ${paginatedQuery.pageSize} Offset ${skipSize}`,
    //   [userId, blogId],
    // );

    //writeSql(posts);

    const totalCount = Number(posts[1]);

    const pagesCount = paginatedQuery.totalPages(totalCount);

    console.log('post with count in getPostsByBlogId', posts);

    console.log('post in getPostsByBlogId', posts[0]);

    if (posts[0].length === 0) return false;

    const mappedPost: Promise<PostsViewType>[] = await this.postViewMapping(
      posts[0],
      userId,
      //newestLikes,
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
