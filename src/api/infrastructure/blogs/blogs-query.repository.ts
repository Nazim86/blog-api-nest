import { BlogsViewType } from './types/blogs-view-type';
import { Injectable } from '@nestjs/common';
import { Blog, BlogDocument } from '../../entities/blog.entity';
import { Model } from 'mongoose';
import { QueryPaginationType } from '../../../types/query-pagination-type';
import { InjectModel } from '@nestjs/mongoose';
import { PaginationType } from '../../../common/pagination';
import { BlogPagination } from './blog-pagination';
import { RoleEnum } from '../../../enums/role-enum';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class BlogsQueryRepo {
  constructor(
    @InjectModel(Blog.name) private BlogModel: Model<BlogDocument>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  private blogsMapping = (array: BlogDocument[]): BlogsViewType[] => {
    return array.map((blog: BlogDocument): BlogsViewType => {
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
          userId: blog.blogOwnerInfo.userId,
          userLogin: blog.blogOwnerInfo.userLogin,
        },
        banInfo: {
          isBanned: blog.banInfo.isBanned,
          banDate: blog.banInfo.banDate,
        },
      };
    });
  };

  async getBlogById(id: string): Promise<BlogsViewType | boolean> {
    try {
      let foundBlog = await this.dataSource.query(
        `SELECT b.*, boi."userId",boi."userLogin", bbi."banDate" 
        FROM public.blogs b Left join public.blog_owner_info boi on b."id" = boi."blogId" 
        Left join public.blog_ban_info bbi on b."id" = bbi."blogId" where b."id" = $1 ;`,
        [id],
      );

      foundBlog = foundBlog[0];

      if (!foundBlog || foundBlog.isBanned) {
        return false;
      }
      return {
        id: foundBlog.id,
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
    requestRole?: RoleEnum,
    userId?: string,
  ): Promise<QueryPaginationType<BlogsViewType[]>> {
    let searchName = '%';
    let isBanned01 = true;
    const isBanned02 = false;
    let blogOwnerUserId = '%';

    const paginatedQuery = new BlogPagination<PaginationType>(
      query.pageNumber,
      query.pageSize,
      query.sortBy,
      query.sortDirection,
      query.searchNameTerm,
    );

    const filter: any = {};
    filter['$and'] = [];

    if (requestRole !== RoleEnum.SA) {
      isBanned01 = false;

      //filter['$and'].push({ 'banInfo.isBanned': false });
    }

    if (paginatedQuery.searchNameTerm) {
      searchName = `%${paginatedQuery.searchNameTerm}%`;
      // filter['$and'].push({
      //   name: { $regex: paginatedQuery.searchNameTerm, $options: 'i' },
      // });
    }
    // console.log(userId);

    if (requestRole === RoleEnum.Blogger) {
      blogOwnerUserId = `%${userId}%`;

      //filter['$and'].push({ 'blogOwnerInfo.userId': userId });
    }
    // // console.log(filter);

    // if (filter.$and.length === 0) {
    //   delete filter.$and;
    // }
    const skipSize = paginatedQuery.skipSize;

    const totalCount = await this.dataSource.query(
      `SELECT count(*)
       FROM public.blogs b Left join public.blog_owner_info boi on b."id"= boi."blogId"
       Left Join public.blog_ban_info bbi on b."id"= bbi."blogId"
       Where b."isBanned"=$1 and b."isBanned"=$2 and b."name"=$3 and b."userId"=$4;`,
      [isBanned01, isBanned02, searchName, blogOwnerUserId],
    );

    //const totalCount = await this.BlogModel.countDocuments(filter);

    const pagesCount = paginatedQuery.totalPages(totalCount[0].count);

    const blog = await this.BlogModel.find(filter)
      .sort({
        [paginatedQuery.sortBy]:
          paginatedQuery.sortDirection === 'asc' ? 1 : -1,
      })
      .skip(skipSize)
      .limit(paginatedQuery.pageSize);

    let mappedBlog: BlogsViewType[];
    if (requestRole === RoleEnum.SA) {
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
