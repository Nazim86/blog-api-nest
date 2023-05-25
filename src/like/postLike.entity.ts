import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { ObjectId } from 'mongodb';

export type PostLikeDocument = HydratedDocument<PostLike>;

// export type PostLikeModelStaticType = {
//   updatePostLikeStatus: (
//     postId: string,
//     userId: string,
//     likeStatus: CreatePostLikeDto,
//     login: string,
//     PostLikeModel: PostLikeModelType,
//   ) => PostLikeDocument;
// };
//
export type PostLikeModelType = Model<PostLike> & PostLikeDocument;

@Schema()
export class PostLike {
  @Prop({ required: true })
  _id: ObjectId;

  @Prop({ required: true })
  postId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  addedAt: Date;

  @Prop({ required: true })
  status: string;

  @Prop({ required: true })
  login: string;

  updatePostLikeStatus(
    postId: string,
    userId: string,
    likeStatus: string,
    login: string,
  ) {
    (this.postId = postId),
      (this.userId = userId),
      (this.status = likeStatus),
      (this.addedAt = new Date()),
      (this.login = login);
  }
}

export const PostLikeSchema = SchemaFactory.createForClass(PostLike);

// const postLikeStaticMethods = {
//   updatePostLikeStatus: PostLike.updatePostLikeStatus,
// };
//
// PostLikeSchema.statics = postLikeStaticMethods;

PostLikeSchema.methods = {
  updatePostLikeStatus: PostLike.prototype.updatePostLikeStatus,
};
