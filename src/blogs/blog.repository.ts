import { Injectable } from '@nestjs/common';
import { BlogsViewType } from './types/blogs-view-type';
import { Blog, BlogDocument } from './blog.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { blogsMapping } from './blogs.mapping';

@Injectable()
export class BlogRepository {
  constructor(@InjectModel(Blog.name) private BlogModel: Model<BlogDocument>) {}
  async createBlog(newBlog: BlogDocument): Promise<BlogsViewType> {
    const blog = await newBlog.save();

    return {
      id: blog.id,
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
    };
  }

  async getBlog(): Promise<BlogsViewType[]> {
    const array = await this.BlogModel.find({}).lean();

    return blogsMapping(array);
  }

  async getBlogById(id: string): Promise<BlogsViewType | null> {
    try {
      const foundBlog = await this.BlogModel.findOne({ _id: new ObjectId(id) });
      if (!foundBlog) {
        return null;
      }
      return {
        id: foundBlog._id.toString(),
        name: foundBlog.name,
        description: foundBlog.description,
        websiteUrl: foundBlog.websiteUrl,
        createdAt: foundBlog.createdAt,
        isMembership: foundBlog.isMembership,
      };
    } catch (e) {
      return null;
    }
  }

  async updateBlog(
    id: string,
    name: string,
    description: string,
    websiteUrl: string,
  ): Promise<boolean> {
    try {
      const result = await this.BlogModel.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            name: name,
            description: description,
            websiteUrl: websiteUrl,
          },
        },
      );
      return result.matchedCount === 1;
    } catch (e) {
      return false;
    }
  }

  async deleteBlogById(id: string): Promise<boolean> {
    try {
      const result = await this.BlogModel.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount === 1;
    } catch (e) {
      return false;
    }
  }
}
