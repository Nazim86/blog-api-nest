import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ObjectId } from 'mongodb';

export type PostLikeDocument = HydratedDocument<PostLike>;

@Schema()
export class PostLike {
  @Prop({ required: true })
  _id: ObjectId;

  @Prop({ required: true })
  postId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  addedAt: string;

  @Prop({ required: true })
  status: string;

  @Prop({ required: true })
  login: string;
}

export const PostLikeSchema = SchemaFactory.createForClass(PostLike);
