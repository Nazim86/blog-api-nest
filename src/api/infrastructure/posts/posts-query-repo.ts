import { Injectable } from '@nestjs/common';
import { PostsViewType } from './types/posts-view-type';
import { LikeEnum } from '../../public/like/like.enum';
import { QueryPaginationType } from '../../../types/query-pagination-type';
import { Pagination, PaginationType } from '../../../common/pagination';
import { BlogRepository } from '../blogs/blog.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Posts } from '../../entities/posts/posts.entity';
import { PostLike } from '../../entities/like/postLike.entity';
import { PostMainImage } from '../../entities/posts/postMainImage.entity';

@Injectable()
export class PostsQueryRepo {
  constructor(
    private readonly blogsRepository: BlogRepository,
    @InjectRepository(Posts) private readonly postsRepo: Repository<Posts>,
    @InjectRepository(PostMainImage)
    private readonly postMainImageRepo: Repository<PostMainImage>,
  ) {}

  private async postViewMapping(
    posts,
    userId: string,
  ): Promise<PostsViewType[]> {
    return posts.map((post) => {
      let myStatus = LikeEnum.None;

      if (userId && post.myStatus) {
        myStatus = post.myStatus;
      }

      return {
        id: post.p_id,
        title: post.p_title,
        shortDescription: post.p_shortDescription,
        content: post.p_content,
        blogId: post.p_blog,
        blogName: post.b_name,
        createdAt: post.p_createdAt,
        extendedLikesInfo: {
          likesCount: Number(post.likesCount),
          dislikesCount: Number(post.dislikesCount),
          myStatus: myStatus,
          newestLikes: post.newestLikes ?? [],
        },
        images: { main: post.mainImages ?? [] },
      };
    });
  }

  async getImages(postId: string) {
    const postMainImage = await this.postMainImageRepo
      .createQueryBuilder('pmi')
      .where('pmi.post = :postId', { postId })
      .getMany();

    const mappedImages = postMainImage.map((image) => {
      return {
        url: image.url,
        width: image.width,
        height: image.height,
        fileSize: image.fileSize,
      };
    });

    return { main: mappedImages };
  }

  async getPostById(postId: string, userId?: string | undefined) {
    try {
      const post = await this.postsRepo
        .createQueryBuilder('p')
        .addSelect(
          (qb) =>
            qb
              .select('status')
              .from(PostLike, 'pl')
              .where('pl.postId = p.id')
              .andWhere('pl.userId = :userId', { userId: userId }),
          'myStatus',
        )
        .addSelect(
          (qb) =>
            qb
              .select(`count(*)`)
              .from(PostLike, 'pl')
              .leftJoin('pl.user', 'u')
              .leftJoin('u.banInfo', 'ub')
              .where('pl.postId = p.id')
              .andWhere(`pl.status = 'Like'`)
              .andWhere('ub.isBanned = false'),
          'likesCount',
        )
        .addSelect(
          (qb) =>
            qb
              .select(`count(*)`)
              .from(PostLike, 'pl')
              .leftJoin('pl.user', 'u')
              .leftJoin('u.banInfo', 'ub')
              .where('pl.postId = p.id')
              .andWhere(`pl.status = 'Dislike'`)
              .andWhere('ub.isBanned = false'),
          'dislikesCount',
        )
        .addSelect(
          (qb) =>
            qb
              .select(
                `jsonb_agg(json_build_object('url', agg.url, 'width', agg.width, 'height', agg.height, 'fileSize', agg."fileSize"))`,
              )
              .from((qb) => {
                return qb
                  .select(`*`)
                  .from(PostMainImage, 'pmi')
                  .where('pmi.post = p.id');
              }, 'agg'),

          'mainImages',
        )
        .addSelect(
          (qb) =>
            qb
              .select(
                `jsonb_agg(json_build_object('addedAt', to_char(
            agg."addedAt"::timestamp at time zone 'UTC',
            'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'), 'user', cast(agg.id as varchar), 'login', agg.login)
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

      return {
        id: post.p_id,
        title: post.p_title,
        shortDescription: post.p_shortDescription,
        content: post.p_content,
        blogId: post.p_blog,
        blogName: blog.name,
        createdAt: post.p_createdAt,
        extendedLikesInfo: {
          likesCount: Number(post.likesCount),
          dislikesCount: Number(post.dislikesCount),
          myStatus: myStatus,
          newestLikes: post.newestLikes ?? [],
        },
        images: { main: post.mainImages ?? [] },
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

    const posts = await this.postsRepo
      .createQueryBuilder('p')
      .addSelect((qb) => qb.select(`count(*)`).from(Posts, 'p'), 'totalCount')
      .addSelect(
        (qb) =>
          qb
            .select('status')
            .from(PostLike, 'pl')
            .where('pl.postId = p.id')
            .andWhere('pl.userId = :userId', { userId: userId }),
        'myStatus',
      )
      .addSelect(
        (qb) =>
          qb
            .select(`count(*)`)
            .from(PostLike, 'pl')
            .leftJoin('pl.user', 'u')
            .leftJoin('u.banInfo', 'ub')
            .where('pl.postId = p.id')
            .andWhere(`pl.status = 'Like'`)
            .andWhere('ub.isBanned = false'),
        'likesCount',
      )
      .addSelect(
        (qb) =>
          qb
            .select(`count(*)`)
            .from(PostLike, 'pl')
            .leftJoin('pl.user', 'u')
            .leftJoin('u.banInfo', 'ub')
            .where('pl.postId = p.id')
            .andWhere(`pl.status = 'Dislike'`)
            .andWhere('ub.isBanned = false'),
        'dislikesCount',
      )
      .addSelect(
        (qb) =>
          qb
            .select(
              `jsonb_agg(json_build_object('addedAt', to_char(
            agg."addedAt"::timestamp at time zone 'UTC',
            'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),'userId', cast(agg.id as varchar), 'login', agg.login)
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
      .orderBy(
        `${
          paginatedQuery.sortBy === 'blogName'
            ? 'b.name'
            : `p.${paginatedQuery.sortBy}`
        }`,
        paginatedQuery.sortDirection,
      )
      .limit(paginatedQuery.pageSize)
      .offset(skipSize)
      .getRawMany();

    const totalCount = Number(posts[0].totalCount);

    const pagesCount = paginatedQuery.totalPages(totalCount);

    const mappedPost: PostsViewType[] = await this.postViewMapping(
      posts,
      userId,
    );

    return {
      pagesCount: pagesCount,
      page: Number(paginatedQuery.pageNumber),
      pageSize: Number(paginatedQuery.pageSize),
      totalCount: totalCount,
      items: mappedPost,
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

    const posts = await this.postsRepo
      .createQueryBuilder('p')
      .addSelect(
        (qb) =>
          qb
            .select(`count(*)`)
            .from(Posts, 'p')
            .leftJoin('p.blog', 'b')
            .where('b.id = :blogId', { blogId: blogId }),
        'totalCount',
      )
      .addSelect(
        (qb) =>
          qb
            .select('status')
            .from(PostLike, 'pl')
            .where('pl.postId = p.id')
            .andWhere('pl.userId = :userId', { userId: userId }),
        'myStatus',
      )
      .addSelect(
        (qb) =>
          qb
            .select(`count(*)`)
            .from(PostLike, 'pl')
            .leftJoin('pl.user', 'u')
            .leftJoin('u.banInfo', 'ub')
            .where('pl.postId = p.id')
            .andWhere(`pl.status = 'Like'`)
            .andWhere('ub.isBanned = false'),
        'likesCount',
      )
      .addSelect(
        (qb) =>
          qb
            .select(`count(*)`)
            .from(PostLike, 'pl')
            .leftJoin('pl.user', 'u')
            .leftJoin('u.banInfo', 'ub')
            .where('pl.postId = p.id')
            .andWhere(`pl.status = 'Dislike' `)
            .andWhere('ub.isBanned = false'),
        'dislikesCount',
      )
      .addSelect(
        (qb) =>
          qb
            .select(
              `jsonb_agg(json_build_object('url', agg.url, 'width', agg.width, 'height', agg.height, 'fileSize', agg."fileSize"))`,
            )
            .from((qb) => {
              return qb
                .select(`*`)
                .from(PostMainImage, 'pmi')
                .where('pmi.post = p.id');
            }, 'agg'),

        'mainImages',
      )
      .addSelect(
        (qb) =>
          qb
            .select(
              `jsonb_agg(json_build_object('addedAt', to_char(
            agg."addedAt"::timestamp at time zone 'UTC',
            'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),'userId', cast(agg.id as varchar), 'login', agg.login)
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
      .leftJoinAndSelect('b.blogBanInfo', 'bbi')
      .where('b.id = :blogId', { blogId: blogId })
      .andWhere(`bbi.isBanned = false`)
      //.andWhere(`ub.isBanned = false`)
      .orderBy(`p.${paginatedQuery.sortBy}`, paginatedQuery.sortDirection)
      .limit(paginatedQuery.pageSize)
      .offset(skipSize)
      .getRawMany();

    if (!posts || posts.length === 0) return false;

    const totalCount = Number(posts[0].totalCount);

    const pagesCount = paginatedQuery.totalPages(totalCount);

    const mappedPost: PostsViewType[] = await this.postViewMapping(
      posts,
      userId,
    );

    return {
      pagesCount: pagesCount,
      page: Number(paginatedQuery.pageNumber),
      pageSize: Number(paginatedQuery.pageSize),
      totalCount: totalCount,
      items: mappedPost,
    };
  }
}
