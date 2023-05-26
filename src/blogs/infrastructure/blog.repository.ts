import { Injectable } from '@nestjs/common';
import { BlogsViewType } from './types/blogs-view-type';
import { Blog, BlogDocument } from '../domain/blog.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { blogsMapping } from './blogs.mapping';

@Injectable()
export class BlogRepository {
  constructor(@InjectModel(Blog.name) private BlogModel: Model<BlogDocument>) {}

  async getBlog(): Promise<BlogsViewType[]> {
    const array = await this.BlogModel.find({}).lean();

    return blogsMapping(array);
  }

  async getBlogById(blogId: string): Promise<BlogDocument | null> {
    try {
      const foundBlog = await this.BlogModel.findOne({
        _id: new ObjectId(blogId),
      });

      if (!foundBlog) {
        return null;
      }
      return foundBlog;
    } catch (e) {
      return null;
    }
  }

  async save(blog: BlogDocument): Promise<BlogDocument> {
    return await blog.save();
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
