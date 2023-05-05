import { BlogsViewType } from './types/blogs-view-type';
import { Injectable } from '@nestjs/common';
import { Blog, BlogDocument } from './blog.entity';
import { Model } from 'mongoose';
import { QueryPaginationType } from '../types/query-pagination-type';
import { InjectModel } from '@nestjs/mongoose';
import { blogsMapping } from './blogs.mapping';
import { ObjectId } from 'mongodb';

@Injectable()
export class BlogQueryRepo {
  constructor(@InjectModel(Blog.name) private BlogModel: Model<BlogDocument>) {}

  async getBlogById(id: string): Promise<BlogsViewType | boolean> {
    try {
      const foundBlog = await this.BlogModel.findOne({ _id: new ObjectId(id) });

      if (!foundBlog) {
        return false;
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
      return false;
    }
  }

  async getBlog(
    searchNameTerm: string,
    sortBy = 'createdAt',
    sortDirection = 'desc',
    pageNumber = 1,
    pageSize = 10,
  ): Promise<QueryPaginationType<BlogsViewType[]>> {
    const filter = { name: { $regex: searchNameTerm ?? '', $options: 'i' } };
    const skipSize = (pageNumber - 1) * pageSize;
    const totalCount = await this.BlogModel.countDocuments(filter);
    const pagesCount = Math.ceil(totalCount / pageSize);

    const getBlog = await this.BlogModel.find(filter)
      .sort({ [sortBy]: sortDirection === 'asc' ? 1 : -1 }) // did not understand well
      .skip(skipSize)
      .limit(pageSize)
      .lean();

    const mappedBlog = blogsMapping(getBlog);
    return {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: mappedBlog,
    };
  }
}
