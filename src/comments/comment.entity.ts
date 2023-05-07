import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CommentDocument = HydratedDocument<Comment>;

@Schema()
export class Comment {
  // _id: ObjectId,
  @Prop({ required: true })
  postId: string;

  @Prop({ required: true })
  content: string;

  @Prop({
    required: true,
    type: {
      userId: String,
      userLogin: String,
    },
  })
  commentatorInfo: { userId: string; userLogin: string };

  @Prop({ required: true })
  createdAt: string;

  @Prop({
    required: true,
    type: {
      likesCount: Number,
      dislikesCount: Number,
      myStatus: String,
    },
  })
  likesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: string;
  };
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
