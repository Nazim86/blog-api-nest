import { ObjectId } from 'mongodb';

// export class BlogsDbType {
//   constructor(
//     public _id: ObjectId,
//     public name: string,
//     public description: string,
//     public websiteUrl: string,
//     public createdAt: string,
//     public isMembership: boolean,
//   ) {}
// }

export type BlogsDbType = {
  _id: ObjectId;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
  blogOwnerInfo?: {
    userId: string;
    userLogin: string;
  };
};
