import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from '../../entities/post.entity';
import { Model } from 'mongoose';
import { PostsViewType } from './types/posts-view-type';
import { NewestLikesType, PostsDbType } from './types/posts-db-type';
import { PostLike, PostLikeDocument } from '../../entities/postLike.entity';
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
    @InjectModel(Post.name) private PostModel: Model<PostDocument>,
    @InjectModel(PostLike.name) private PostLikeModel: Model<PostLikeDocument>,
    private readonly postMapping: PostMapping,
    private readonly blogsRepository: BlogRepository,
  ) {}

  async getPostById(postId: string, userId?: string | undefined) {
    try {
      let post = await this.dataSource.query(
        `SELECT p.* FROM public.posts p where p."id"=$1`,
        [postId],
      );

      post = post[0];

      console.log('post in post query repo', post);

      // const post: PostDocument | null = await this.PostModel.findOne({
      //   _id: new ObjectId(postId),
      // });

      if (!post) {
        return false;
      }

      const blog = await this.blogsRepository.getBlogById(post.blogId);

      console.log('blog iin post query', blog);

      if (blog.isBanned) {
        return false;
      }

      let myStatus = 'None';

      if (userId) {
        const likeInDb = await this.dataSource.query(
          `SELECT id, "postId", "userId", "addedAt", status, login, "banStatus"
            FROM public.post_like pl Where pl."postId"=$1 and pl."userId"=$2;`,
          [postId, userId],
        );
        //const likeInDb = await this.PostLikeModel.findOne({ postId, userId });
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

      // const likesCount = await this.PostLikeModel.countDocuments({
      //   postId,
      //   status: LikeEnum.Like,
      //   banStatus: false,
      // });
      // const dislikesCount = await this.PostLikeModel.countDocuments({
      //   postId,
      //   status: LikeEnum.Dislike,
      //   banStatus: false,
      // });

      console.log('before 3 last like');

      const sortBy = 'addedAt';

      const getLast3Likes = await this.dataSource.query(
        `SELECT count(*) 
        FROM public.post_like pl 
        Where pl."postId"=$1 and pl."status"=$2 and pl."banStatus"=$3
        Group by pl."addedAt"
        Order by "${sortBy}" desc
        Limit 3;`,
        [post.id, LikeEnum.Like, false],
      );

      console.log('after get3likes');

      console.log('get last 3 likes', getLast3Likes);
      //   await this.PostLikeModel.find({
      //   postId,
      //   status: LikeEnum.Like,
      //   banStatus: false,
      // })
      //   .sort({ addedAt: -1 }) // sort by addedAt in descending order
      //   .limit(3) // limit to 3 results
      //   .lean();

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
    const totalCount = await this.PostModel.countDocuments({});
    const pagesCount = paginatedQuery.totalPages(totalCount);

    const getposts: PostsDbType[] = await this.PostModel.find({})
      .sort({
        [paginatedQuery.sortBy]:
          paginatedQuery.sortDirection === 'asc' ? 1 : -1,
      })
      .skip(skipSize)
      .limit(paginatedQuery.pageSize)
      .lean();

    const mappedPost: Promise<PostsViewType>[] =
      await this.postMapping.postViewMapping(getposts, userId);

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
    const totalCount = await this.PostModel.countDocuments({ blogId: blogId });
    const pagesCount = paginatedQuery.totalPages(totalCount);

    const getPostsByBlogId: PostsDbType[] = await this.PostModel.find({
      blogId: blogId,
    })
      .sort({
        [paginatedQuery.sortBy]:
          paginatedQuery.sortDirection === 'asc' ? 1 : -1,
      })
      .skip(skipSize)
      .limit(paginatedQuery.pageSize)
      .lean();

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
