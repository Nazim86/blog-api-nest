import { Injectable } from '@nestjs/common';
import { BlogsViewType } from './types/blogs-view-type';
import { BlogsDbType } from './types/blogs-db-type';

@Injectable()
export class BlogRepository {
  async createBlog(newBlog: BlogsDbType): Promise<BlogsViewType> {
    const result = await BlogModel.create(newBlog);

    return {
      id: result._id.toString(),
      name: newBlog.name,
      description: newBlog.description,
      websiteUrl: newBlog.websiteUrl,
      createdAt: newBlog.createdAt,
      isMembership: newBlog.isMembership,
    };
  }

  async getBlog(): Promise<BlogsViewType[]> {
    const array = await BlogModel.find({}).lean();

    return blogMapping(array);
  }

  async getBlogById(id: string): Promise<BlogsViewType | null> {
    try {
      const foundBlog = await BlogModel.findOne({ _id: new ObjectId(id) });
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
      const result = await BlogModel.updateOne(
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
      const result = await BlogModel.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount === 1;
    } catch (e) {
      return false;
    }
  }
}
