import { ObjectId } from 'mongodb';
import { PostsViewType } from '../types/posts-view-type';
import { Post, PostDocument, PostModuleType } from '../domain/post.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PostRepository {
  constructor(@InjectModel(Post.name) private PostModel: PostModuleType) {}
  async getPostById(postId: string): Promise<PostDocument | null> {
    return this.PostModel.findOne({ _id: new ObjectId(postId) });
  }

  async save(post: PostDocument) {
    return post.save();
  }

  async createPostForBlog(newPost: PostDocument): Promise<PostsViewType> {
    await newPost.save();

    return {
      id: newPost.id,
      title: newPost.title,
      shortDescription: newPost.shortDescription,
      content: newPost.content,
      blogId: newPost.blogId,
      blogName: newPost.blogName,
      createdAt: newPost.createdAt,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None', //LikeEnum.None,
        newestLikes: [],
      },
    };
  }

  // async updatePost(
  //   id: string,
  //   title: string,
  //   shortDescription: string,
  //   content: string,
  //   blogId: string,
  // ): Promise<boolean> {
  //   try {
  //     const result = await PostModel.updateOne(
  //       { _id: new ObjectId(id) },
  //       {
  //         $set: {
  //           title: title,
  //           shortDescription: shortDescription,
  //           content: content,
  //           blogId: blogId,
  //         },
  //       },
  //     );
  //
  //     return result.matchedCount === 1;
  //   } catch (e) {
  //     return false;
  //   }
  // }

  // async updatePostLikeStatus(
  //   postId: string,
  //   userId: string,
  //   likeStatus: string,
  //   login: string,
  // ) {
  //   const result: UpdateResult = await PostLikeModel.updateOne(
  //     { postId, userId },
  //     {
  //       $set: {
  //         addedAt: new Date().toISOString(),
  //         status: likeStatus,
  //         login: login,
  //       },
  //     },
  //     { upsert: true },
  //   );
  //
  //   return result.upsertedCount === 1 || result.modifiedCount === 1;
  // }

  async deletePostById(id: string): Promise<boolean> {
    try {
      const result = await this.PostModel.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount === 1;
    } catch (e) {
      return false;
    }
  }
}
