import { HydratedDocument, Model } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CreateLikeDto } from './createLikeDto';

export type CommentLikeDocument = HydratedDocument<CommentLike>;

export type CommentLikeModelStaticType = {
  createCommentLike: (
    commentId: string,
    userId: string,
    createLikeDto: CreateLikeDto,
    CommentLikeModel: CommentLikeModelType,
  ) => CommentLikeDocument;
};

export type CommentLikeModelType = Model<CommentLike> &
  CommentLikeModelStaticType;
@Schema()
export class CommentLike {
  @Prop({ required: true })
  commentId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  addedAt: Date;

  @Prop({ required: true })
  status: string;

  static createCommentLike(
    commentId: string,
    userId: string,
    createLikeDto: CreateLikeDto,
    CommentLikeModel: CommentLikeModelType,
  ) {
    const newCommentLike = {
      commentId: commentId,
      userId: userId,
      addedAt: new Date(),
      status: createLikeDto.likeStatus,
    };
    return new CommentLikeModel(newCommentLike);
  }

  updateCommentLikeStatus(
    //commentId: string,
    //userId: string,
    createLikeDto: CreateLikeDto,
  ) {
    (this.addedAt = new Date()), (this.status = createLikeDto.likeStatus);
  }
}

export const CommentLikeSchema = SchemaFactory.createForClass(CommentLike);

const commentLikeStaticMethods = {
  createCommentLike: CommentLike.createCommentLike,
};

CommentLikeSchema.statics = commentLikeStaticMethods;

CommentLikeSchema.methods = {
  updateCommentLikeStatus: CommentLike.prototype.updateCommentLikeStatus,
};
