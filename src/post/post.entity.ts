import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { CreatePostDto } from './createPostDto';
import { BlogDocument } from '../blogs/blog.entity';

export type PostDocument = HydratedDocument<Post>;

export type PostModelStaticType = {
  createPost: (
    createPostDto: CreatePostDto,
    PostModel: PostModuleType,
  ) => PostDocument;
};

export type PostModuleType = Model<Post> & PostModelStaticType;

@Schema()
export class Post {
  @Prop({ required: true })
  _id: ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  shortDescription: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  blogId: string;

  @Prop({ required: true })
  blogName: string;

  @Prop({ required: true })
  createdAt: string;

  static createPost(
    createPostDto: CreatePostDto,
    PostModule: PostModuleType,
    Blog: BlogDocument,
  ): PostDocument {
    const newPost = {
      title: createPostDto.title,
      shortDescription: createPostDto.shortDescription,
      content: createPostDto.content,
      blogId: Blog.id,
      blogName: Blog.name,
      createdAt: new Date(),
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
        newestLikes: [
          {
            addedAt: '2023-05-06T09:11:25.182Z',
            userId: 'string',
            login: 'string',
          },
        ],
      },
    };
    return new PostModule(createPostDto);
  }
}

export const PostSchema = SchemaFactory.createForClass(Post);

const postStaticMethods = {
  createPost: Post.createPost,
};

PostSchema.statics = postStaticMethods;
