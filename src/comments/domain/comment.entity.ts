import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreateCommentDto } from '../createComment.Dto';

export type CommentDocument = HydratedDocument<Comment>;

export type CommentModelStaticType = {
  createComment: (
    createCommentDto: CreateCommentDto,
    postId: string,
    userId: string,
    userLogin: string,
    CommentModel: CommentModelType,
  ) => CommentDocument;
};

export type CommentModelType = Model<Comment> & CommentModelStaticType;

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

  // @Prop({
  //   required: true,
  //   type: {
  //     likesCount: Number,
  //     dislikesCount: Number,
  //     myStatus: String,
  //   },
  // })
  // likesInfo: {
  //   likesCount: number;
  //   dislikesCount: number;
  //   myStatus: string;
  // };

  static createComment(
    createCommentDto: CreateCommentDto,
    postId: string,
    userId: string,
    userLogin: string,
    CommentModel: CommentModelType,
  ) {
    const newComment = {
      postId: postId,
      content: createCommentDto.content,
      commentatorInfo: {
        userId: userId,
        userLogin: userLogin,
      },
      createdAt: new Date(),
    };
    return new CommentModel(newComment);
  }
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

const commentStaticMethods = { createComment: Comment.createComment };

CommentSchema.statics = commentStaticMethods;
