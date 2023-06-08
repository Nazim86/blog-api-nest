import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from '../../../../domains/post.entity';
import { Model } from 'mongoose';
import { PostsViewType } from '../types/posts-view-type';
import { NewestLikesType, PostsDbType } from '../types/posts-db-type';
import { ObjectId } from 'mongodb';
import {
  PostLike,
  PostLikeDocument,
} from '../../../../domains/postLike.entity';
import { LikeEnum } from '../../like/like.enum';
import { PostLikesDbType } from '../../like/post-likes-db-type';
import { QueryPaginationType } from '../../../../types/query-pagination-type';
import { newestLikesMapping } from '../../like/post-likes.mapping';
import { PostMapping } from '../mapper/post.mapping';
import { Pagination, PaginationType } from '../../../../common/pagination';

@Injectable()
export class PostsQueryRepo {
  constructor(
    @InjectModel(Post.name) private PostModel: Model<PostDocument>,
    @InjectModel(PostLike.name) private PostLikeModel: Model<PostLikeDocument>,
    private readonly postMapping: PostMapping,
  ) {}

  async getPostById(
    postId: string,
    userId?: string | undefined,
  ): Promise<PostsViewType | boolean> {
    try {
      const post: PostDocument | null = await this.PostModel.findOne({
        _id: new ObjectId(postId),
      });

      if (!post) {
        return false;
      }

      let myStatus = 'None';

      if (userId) {
        const likeInDb = await this.PostLikeModel.findOne({ postId, userId });
        if (likeInDb) {
          myStatus = likeInDb.status;
        }
      }

      const likesCount = await this.PostLikeModel.countDocuments({
        postId,
        status: LikeEnum.Like,
      });
      const dislikesCount = await this.PostLikeModel.countDocuments({
        postId,
        status: LikeEnum.Dislike,
      });

      const getLast3Likes: PostLikesDbType[] = await this.PostLikeModel.find({
        postId,
        status: LikeEnum.Like,
      })
        .sort({ addedAt: -1 }) // sort by addedAt in descending order
        .limit(3) // limit to 3 results
        .lean();

      const newestLikes: NewestLikesType[] = newestLikesMapping(getLast3Likes);

      return {
        id: post._id.toString(),
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
      .sort({ [query.sortBy]: query.sortDirection === 'asc' ? 1 : -1 })
      .skip(skipSize)
      .limit(query.pageSize)
      .lean();

    const mappedPost: Promise<PostsViewType>[] =
      await this.postMapping.postViewMapping(getposts, userId);

    const resolvedMappedPosts: PostsViewType[] = await Promise.all(mappedPost);

    return {
      pagesCount: pagesCount,
      page: Number(query.pageNumber),
      pageSize: Number(query.pageSize),
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
