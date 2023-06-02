import { BlogsViewType } from './types/blogs-view-type';
import { Injectable } from '@nestjs/common';
import { Blog, BlogDocument } from '../domain/blog.entity';
import { Model } from 'mongoose';
import { QueryPaginationType } from '../../types/query-pagination-type';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { PaginationType } from '../../common/pagination';
import { BlogPagination } from '../domain/blog-pagination';
import { BlogsDbType } from './types/blogs-db-type';

@Injectable()
export class BlogsQueryRepo {
  constructor(@InjectModel(Blog.name) private BlogModel: Model<BlogDocument>) {}

  private blogsMapping = (array: BlogsDbType[]): BlogsViewType[] => {
    return array.map((blog: BlogsDbType): BlogsViewType => {
      return {
        id: blog._id.toString(),
        name: blog.name,
        description: blog.description,
        websiteUrl: blog.websiteUrl,
        createdAt: blog.createdAt,
        isMembership: blog.isMembership,
      };
    });
  };

  private blogsMappingForSA = (array: BlogDocument[]): BlogsViewType[] => {
    return array.map((blog: BlogDocument): BlogsViewType => {
      return {
        id: blog._id.toString(),
        name: blog.name,
        description: blog.description,
        websiteUrl: blog.websiteUrl,
        createdAt: blog.createdAt,
        isMembership: blog.isMembership,
        blogOwnerInfo: {
          userId: blog.blogOwnerInfo.userId ?? null,
          userLogin: blog.blogOwnerInfo.userLogin ?? null,
        },
      };
    });
  };

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
    query: BlogPagination<PaginationType>,
    requestType?: string,
  ): Promise<QueryPaginationType<BlogsViewType[]>> {
    const paginatedQuery = new BlogPagination<PaginationType>(
      query.pageNumber,
      query.pageSize,
      query.sortBy,
      query.sortDirection,
      query.searchNameTerm,
    );

    let filter = {};

    if (paginatedQuery.searchNameTerm) {
      filter = {
        name: { $regex: paginatedQuery.searchNameTerm, $options: 'i' },
      };
    }

    const skipSize = paginatedQuery.skipSize;
    const totalCount = await this.BlogModel.countDocuments(filter);
    const pagesCount = paginatedQuery.totalPages(totalCount);

    const blog = await this.BlogModel.find(filter)
      .sort({
        [paginatedQuery.sortBy]:
          paginatedQuery.sortDirection === 'asc' ? 1 : -1,
      }) // did not understand well
      .skip(skipSize)
      .limit(paginatedQuery.pageSize);

    let mappedBlog: BlogsViewType[] = [];
    if (requestType === 'SA') {
      mappedBlog = this.blogsMappingForSA(blog);
    } else {
      mappedBlog = this.blogsMapping(blog);
    }

    return {
      pagesCount: pagesCount,
      page: Number(paginatedQuery.pageNumber),
      pageSize: Number(paginatedQuery.pageSize),
      totalCount: totalCount,
      items: mappedBlog,
    };
  }

  // async getBlogForSA(query: BlogPagination<PaginationType>) {
  //   const paginatedQuery = new BlogPagination<PaginationType>(
  //     query.pageNumber,
  //     query.pageSize,
  //     query.sortBy,
  //     query.sortDirection,
  //     query.searchNameTerm,
  //   );
  // }
}
