import { ObjectId } from 'mongodb';

// export class CommentsDbType {
//
//     constructor(
//         public _id: ObjectId,
//         public postId: string,
//         public content: string,
//         public commentatorInfo: {
//             userId: string,
//             userLogin: string
//         },
//         public createdAt: string,
//         public likesInfo: {
//             likesCount: number,
//             dislikesCount: number,
//             myStatus: string
//         }) {}
//
//
// }

export type CommentsDbType = {
  _id: ObjectId;
  postId: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: string;
  likesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: string;
  };
};
