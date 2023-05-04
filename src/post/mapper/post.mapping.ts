import { NewestLikesType, PostsDbType } from '../types/posts-db-type';
import { PostsViewType } from '../types/posts-view-type';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PostLike, PostLikeDocument } from '../../like/post.like.schema';
import { PostLikesDbType } from '../types/post-likes-db-type';
import { LikeEnum } from '../../enums/like.enum';
import { newestLikesMapping } from './post-likes.mapping';

export class PostMapping {
  constructor(
    @InjectModel(PostLike.name) private PostLikeModel: Model<PostLikeDocument>,
  ) {}

  async postViewMapping(
    array: PostsDbType[],
    userId: string | undefined,
  ): Promise<Promise<PostsViewType>[]> {
    return array.map(async (post: PostsDbType): Promise<PostsViewType> => {
      let myStatus = 'None';

      if (userId) {
        const likeInDb = await this.PostLikeModel.findOne({
          postId: post._id,
          userId,
        });
        if (likeInDb) {
          myStatus = likeInDb.status;
        }
      }

      const likesCount = await this.PostLikeModel.countDocuments({
        postId: post._id.toString(),
        status: LikeEnum.Like,
      });
      const dislikesCount = await this.PostLikeModel.countDocuments({
        postId: post._id.toString(),
        status: LikeEnum.Dislike,
      });

      const getLast3Likes: PostLikesDbType[] = await this.PostLikeModel.find({
        postId: post._id,
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
    });
  }
}
