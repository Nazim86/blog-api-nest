import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type CommentLikeDocument = HydratedDocument<CommentLike>;
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

  updateCommentLikeStatus(
    commentId: string,
    userId: string,
    likeStatus: string,
  ) {
    (this.commentId = commentId),
      (this.userId = userId),
      (this.addedAt = new Date()),
      (this.status = likeStatus);
  }
}

export const CommentLikeSchema = SchemaFactory.createForClass(CommentLike);

CommentLikeSchema.methods = {
  updateCommentLikeStatus: CommentLike.prototype.updateCommentLikeStatus,
};
