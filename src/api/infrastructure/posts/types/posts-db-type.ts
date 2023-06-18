import { ObjectId } from 'mongodb';

export type NewestLikesType = {
  addedAt: Date;
  userId: string | undefined;
  login: string;
};

export type ExtendedLikesInfoType = {
  likesCount: number;
  dislikesCount: number;
  myStatus: string;
  newestLikes: NewestLikesType[];
};

// export class PostsDbType {
//   constructor(
//     public _id: ObjectId,
//     public title: string,
//     public shortDescription: string,
//     public content: string,
//     public blogId: string,
//     public blogName: string | null,
//     public createdAt: string,
//     public extendedLikesInfo: ExtendedLikesInfoType,
//   ) {}
// }

export type PostsDbType = {
  _id: ObjectId;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string | null;
  createdAt: string;
  extendedLikesInfo: ExtendedLikesInfoType;
};
