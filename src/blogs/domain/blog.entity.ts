import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreateBlogDto } from '../createBlog.dto';

export type BlogDocument = HydratedDocument<Blog>;

export type BlogModelStaticType = {
  createBlog: (
    createdBlogDto: CreateBlogDto,
    BlogModel: BlogModelType,
  ) => BlogDocument;
};

export type BlogModelType = Model<Blog> & BlogModelStaticType;

@Schema()
export class Blog {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  websiteUrl: string;

  @Prop({ required: true })
  createdAt: string;

  @Prop({ required: true })
  isMembership: boolean;

  @Prop({
    type: {
      userId: { type: String, required: true },
      userLogin: { type: String, required: true },
    },
  })
  blogOwnerInfo: {
    userId: string;
    userLogin: string;
  };

  static createBlog(
    createBlog: CreateBlogDto,
    BlogModel: BlogModelType,
  ): BlogDocument {
    const newBlog = {
      name: createBlog.name,
      description: createBlog.description,
      websiteUrl: createBlog.websiteUrl,
      createdAt: new Date().toISOString(),
      isMembership: false,
    };
    return new BlogModel(newBlog);
  }

  updateBlog(updateBlogDto: CreateBlogDto) {
    this.name = updateBlogDto.name;
    this.description = updateBlogDto.description;
    this.websiteUrl = updateBlogDto.websiteUrl;
  }

  bindBlogWithUser(userId: string, userLogin: string) {
    console.log(userId, userLogin);
    this.blogOwnerInfo.userId = userId;
    this.blogOwnerInfo.userLogin = userLogin;

    console.log('exiting bindBlogWithUser');
  }
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

BlogSchema.methods = {
  updateBlog: Blog.prototype.updateBlog,
  bindBlogWithUser: Blog.prototype.bindBlogWithUser,
};

const blogStaticMethods: BlogModelStaticType = {
  createBlog: Blog.createBlog,
};

BlogSchema.statics = blogStaticMethods;
