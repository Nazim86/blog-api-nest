import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreateBlogDto } from '../../blogger/inputModel-Dto/createBlog.dto';

export type BlogDocument = HydratedDocument<Blog>;

export type BlogModelStaticType = {
  createBlog: (
    userId: string,
    userLogin: string,
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

  @Prop({ required: true, type: { isBanned: Boolean, banDate: String } })
  banInfo: {
    isBanned: boolean;
    banDate: string | null;
  };
  @Prop({
    required: true,
    type: {
      userId: { type: String },
      userLogin: { type: String },
    },
  })
  blogOwnerInfo: {
    userId: string | null;
    userLogin: string | null;
  };

  static createBlog(
    userId: string,
    userLogin: string,
    createBlog: CreateBlogDto,
    BlogModel: BlogModelType,
  ): BlogDocument {
    const newBlog = {
      name: createBlog.name,
      description: createBlog.description,
      websiteUrl: createBlog.websiteUrl,
      createdAt: new Date().toISOString(),
      isMembership: false,
      blogOwnerInfo: {
        userId: userId,
        userLogin: userLogin,
      },
      banInfo: {
        isBanned: false,
        banDate: null,
      },
    };
    return new BlogModel(newBlog);
  }

  updateBlog(updateBlogDto: CreateBlogDto) {
    this.name = updateBlogDto.name;
    this.description = updateBlogDto.description;
    this.websiteUrl = updateBlogDto.websiteUrl;
  }

  bindBlogWithUser(userId: string, userLogin: string) {
    this.blogOwnerInfo.userId = userId;
    this.blogOwnerInfo.userLogin = userLogin;
  }
  banBlog(banStatus: boolean) {
    this.banInfo.isBanned = banStatus;
    this.banInfo.banDate = new Date().toISOString();
  }
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

BlogSchema.methods = {
  updateBlog: Blog.prototype.updateBlog,
  bindBlogWithUser: Blog.prototype.bindBlogWithUser,
  banBlog: Blog.prototype.banBlog,
};

const blogStaticMethods: BlogModelStaticType = {
  createBlog: Blog.createBlog,
};

BlogSchema.statics = blogStaticMethods;
