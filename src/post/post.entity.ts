import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreatePostDto } from './createPostDto';

export type PostDocument = HydratedDocument<Post>;

export type PostModelStaticType = {
  createPost: (
    createPostDto: CreatePostDto,
    PostModel: PostModuleType,
    blogName: string,
  ) => PostDocument;
};

export type PostModuleType = Model<Post> & PostModelStaticType;

@Schema()
export class Post {
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

  //instance method
  updatePost(updatePostDto: CreatePostDto) {
    (this.title = updatePostDto.title),
      (this.shortDescription = updatePostDto.shortDescription),
      (this.content = updatePostDto.content),
      (this.blogId = updatePostDto.blogId);
  }

  static createPost(
    createPostDto: CreatePostDto,
    PostModel: PostModuleType,
    blogName: string,
  ): PostDocument {
    const newPost = {
      title: createPostDto.title,
      shortDescription: createPostDto.shortDescription,
      content: createPostDto.content,
      blogId: createPostDto.blogId,
      blogName: blogName,
      createdAt: new Date().toISOString(),
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
    return new PostModel(newPost);
  }
}

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.methods = { updatePost: Post.prototype.updatePost };

const postStaticMethods = {
  createPost: Post.createPost,
};

PostSchema.statics = postStaticMethods;
