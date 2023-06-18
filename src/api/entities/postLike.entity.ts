import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreateLikeDto } from '../public/like/createLikeDto';

export type PostLikeDocument = HydratedDocument<PostLike>;

export type PostLikeModelStaticType = {
  createPostLike: (
    postId: string,
    userId: string,
    createLikeDto: CreateLikeDto,
    login: string,
    PostLikeModel: PostLikeModelType,
  ) => PostLikeDocument;
};

export type PostLikeModelType = Model<PostLike> & PostLikeModelStaticType;

@Schema()
export class PostLike {
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

  @Prop()
  banStatus: boolean;
  static createPostLike(
    postId: string,
    userId: string,
    createLikeDto: CreateLikeDto,
    login: string,
    PostLikeModel: PostLikeModelType,
  ) {
    const postLike = {
      postId: postId,
      userId: userId,
      addedAt: new Date(),
      status: createLikeDto.likeStatus,
      login: login,
      banStatus: false,
    };
    return new PostLikeModel(postLike);
  }
  updatePostLikeStatus(createLikeDto: CreateLikeDto) {
    (this.status = createLikeDto.likeStatus), (this.addedAt = new Date());
  }
}

export const PostLikeSchema = SchemaFactory.createForClass(PostLike);

const postLikeStaticMethods = {
  createPostLike: PostLike.createPostLike,
};

PostLikeSchema.statics = postLikeStaticMethods;

PostLikeSchema.methods = {
  updatePostLikeStatus: PostLike.prototype.updatePostLikeStatus,
};
