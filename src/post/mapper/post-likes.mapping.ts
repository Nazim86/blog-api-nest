import { PostLikesDbType } from '../types/post-likes-db-type';
import { NewestLikesType } from '../types/posts-db-type';

export const newestLikesMapping = (
  postLikes: PostLikesDbType[],
): NewestLikesType[] => {
  return postLikes.map((likes: PostLikesDbType): NewestLikesType => {
    return {
      addedAt: likes.addedAt,
      userId: likes.userId,
      login: likes.login,
    };
  });
};
