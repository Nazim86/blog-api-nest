import { LikeEnum } from './like.enum';

export type PostLikesDbType = {
  id: string;
  postId: string;
  userId: string;
  addedAt: Date;
  status: LikeEnum;
  login: string;
};
