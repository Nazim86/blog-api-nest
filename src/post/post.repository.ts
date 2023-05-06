import { PostLikeModel, PostModel } from '../../db/db';
import { ObjectId, UpdateResult } from 'mongodb';
import { PostsViewType } from './types/posts-view-type';
import { PostsDbType } from './types/posts-db-type';
import { LikeEnum } from './enums/like-enum';
import { injectable } from 'inversify';

@injectable()
export class PostRepository {
  async createPost(newPost: PostsDbType): Promise<PostsViewType> {
    const result = await PostModel.create(newPost);

    return {
      id: result._id.toString(),
      title: newPost.title,
      shortDescription: newPost.shortDescription,
      content: newPost.content,
      blogId: newPost.blogId,
      blogName: newPost.blogName,
      createdAt: newPost.createdAt,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeEnum.None,
        newestLikes: [],
      },
    };
  }

  async createPostForBlog(
    createPostForBlog: PostsDbType,
  ): Promise<PostsViewType> {
    const result = await PostModel.create(createPostForBlog);

    return {
      id: result._id.toString(),
      title: createPostForBlog.title,
      shortDescription: createPostForBlog.shortDescription,
      content: createPostForBlog.content,
      blogId: createPostForBlog.blogId,
      blogName: createPostForBlog.blogName,
      createdAt: createPostForBlog.createdAt,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeEnum.None,
        newestLikes: [],
      },
    };
  }

  async updatePost(
    id: string,
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
  ): Promise<boolean> {
    try {
      const result = await PostModel.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            title: title,
            shortDescription: shortDescription,
            content: content,
            blogId: blogId,
          },
        },
      );

      return result.matchedCount === 1;
    } catch (e) {
      return false;
    }
  }

  async updatePostLikeStatus(
    postId: string,
    userId: string,
    likeStatus: string,
    login: string,
  ) {
    const result: UpdateResult = await PostLikeModel.updateOne(
      { postId, userId },
      {
        $set: {
          addedAt: new Date().toISOString(),
          status: likeStatus,
          login: login,
        },
      },
      { upsert: true },
    );

    return result.upsertedCount === 1 || result.modifiedCount === 1;
  }

  async deletePostById(id: string): Promise<boolean> {
    try {
      const result = await PostModel.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount === 1;
    } catch (e) {
      return false;
    }
  }
}
