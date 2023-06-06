import { ObjectId } from 'mongoose';
import { LikeEnum } from './like.enum';

export type PostLikesDbType = {
  _id: ObjectId;
  postId: string;
  userId: string;
  addedAt: Date;
  status: LikeEnum;
  login: string;
};
