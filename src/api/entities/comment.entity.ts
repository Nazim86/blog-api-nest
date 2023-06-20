import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreateCommentDto } from '../public/comments/createComment.Dto';

export type CommentDocument = HydratedDocument<Comment>;

export type CommentModelStaticType = {
  createComment: (
    createCommentDto: CreateCommentDto,
    postId: string,
    userId: string,
    userLogin: string,
    CommentModel: CommentModelType,
    title: string,
    blogId: string,
    blogName: string,
    blogOwnerId: string,
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
    _id: false,
    required: true,
    type: {
      userId: String,
      userLogin: String,
      isBanned: Boolean,
    },
  })
  commentatorInfo: { userId: string; userLogin: string; isBanned: boolean };

  @Prop({
    _id: false,
    required: true,
    type: {
      title: String,
      blogId: String,
      blogName: String,
      blogOwnerId: String,
    },
  })
  postInfo: {
    title: string;
    blogId: string;
    blogName: string;
    blogOwnerId: string;
  };

  @Prop({ required: true })
  createdAt: string;

  static createComment(
    createCommentDto: CreateCommentDto,
    postId: string,
    userId: string,
    userLogin: string,
    CommentModel: CommentModelType,
    title: string,
    blogId: string,
    blogName: string,
    blogOwnerId: string,
  ) {
    const newComment = {
      postId: postId,
      content: createCommentDto.content,
      commentatorInfo: {
        userId: userId,
        userLogin: userLogin,
        isBanned: false,
      },
      postInfo: {
        title: title,
        blogId: blogId,
        blogName: blogName,
        blogOwnerId: blogOwnerId,
      },
      createdAt: new Date().toISOString(),
    };
    return new CommentModel(newComment);
  }

  updateComment(createCommentDto: CreateCommentDto) {
    this.content = createCommentDto.content;
  }
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

const commentStaticMethods = { createComment: Comment.createComment };

CommentSchema.methods = { updateComment: Comment.prototype.updateComment };

CommentSchema.statics = commentStaticMethods;
