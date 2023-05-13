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

  updateBlog(updateBlogDto: CreateBlogDto) {
    this.name = updateBlogDto.name;
    this.description = updateBlogDto.description;
    this.websiteUrl = updateBlogDto.websiteUrl;
  }

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
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

BlogSchema.methods = { updateBlog: Blog.prototype.updateBlog };

const blogStaticMethods: BlogModelStaticType = {
  createBlog: Blog.createBlog,
};

BlogSchema.statics = blogStaticMethods;
