import { Injectable } from '@nestjs/common';
import { Blog, BlogDocument, BlogModelType } from '../../entities/blog.entity';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';

@Injectable()
export class BlogRepository {
  constructor(@InjectModel(Blog.name) private BlogModel: BlogModelType) {}

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

  async getBlogByBlogOwnerId(userId: string) {
    return this.BlogModel.find({
      'blogOwnerInfo.userId': userId,
    });
  }

  async deleteBlogOwnerInfo(userId: string) {
    const result = await this.BlogModel.updateMany(
      { 'blogOwnerInfo.userId': userId },
      {
        $set: { 'blogOwnerInfo.userId': null, 'blogOwnerInfo.userLogin': null },
      },
    );

    return result.matchedCount === 1;
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
