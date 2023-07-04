import { NewestLikesType } from '../../../infrastructure/posts/types/posts-db-type';
import { PostsViewType } from '../../../infrastructure/posts/types/posts-view-type';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PostLike, PostLikeDocument } from '../../../entities/postLike.entity';
import { LikeEnum } from '../../like/like.enum';
import { newestLikesMapping } from '../../like/post-likes.mapping';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export class PostMapping {
  constructor(
    @InjectModel(PostLike.name) private PostLikeModel: Model<PostLikeDocument>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  //TODO: Question Why there is two promises?
  //TODO: Question Why I cannot change CommentsDbType? When change .map is not recognized
  async postViewMapping(
    posts,
    userId: string | undefined,
  ): Promise<Promise<PostsViewType>[]> {
    return posts.map(async (post): Promise<PostsViewType> => {
      let myStatus = 'None';

      if (userId) {
        let likeInDb = await this.dataSource.query(
          `SELECT id, "postId", "userId", "addedAt", status, login, "banStatus"
            FROM public.post_like pl Where pl."postId"=$1 and pl."userId"=$2;`,
          [post.id, userId],
        );

        likeInDb = likeInDb[0];
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
    });
  }
}
