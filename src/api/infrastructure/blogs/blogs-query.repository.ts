import { BlogsViewType } from './types/blogs-view-type';
import { Injectable } from '@nestjs/common';
import { QueryPaginationType } from '../../../types/query-pagination-type';
import { PaginationType } from '../../../common/pagination';
import { BlogPagination } from './blog-pagination';
import { RoleEnum } from '../../../enums/role-enum';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class BlogsQueryRepo {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  private blogsMapping = (array): BlogsViewType[] => {
    return array.map((blog): BlogsViewType => {
      return {
        id: blog.id,
        name: blog.name,
        description: blog.description,
        websiteUrl: blog.websiteUrl,
        createdAt: blog.createdAt,
        isMembership: blog.isMembership,
      };
    });
  };

  private blogsMappingForSA = (array) => {
    return array.map((blog) => {
      return {
        id: blog.id,
        name: blog.name,
        description: blog.description,
        websiteUrl: blog.websiteUrl,
        createdAt: blog.createdAt,
        isMembership: blog.isMembership,
        blogOwnerInfo: {
          userId: blog.userId,
          userLogin: blog.userLogin,
        },
        banInfo: {
          isBanned: blog.isBanned,
          banDate: blog.banDate,
        },
      };
    });
  };

  async getBlogById(id: string): Promise<BlogsViewType | boolean> {
    try {
      let foundBlog = await this.dataSource.query(
        `SELECT b.*, u."login", bbi."banDate" 
        FROM public.blogs b 
        Left join public.users u on b."ownerId" = u."id"
        Left join public.blog_ban_info bbi on b."id" = bbi."blogId" 
        where b."id" = $1 ;`,
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
    let isBanned01 = false;
    const isBanned02 = false;
    let blogOwnerUserId = '%';

    const paginatedQuery = new BlogPagination<PaginationType>(
      query.pageNumber,
      query.pageSize,
      query.sortBy,
      query.sortDirection,
      query.searchNameTerm,
    );

    if (paginatedQuery.searchNameTerm) {
      searchName = `%${paginatedQuery.searchNameTerm}%`;
    }

    if (requestRole === RoleEnum.Blogger) {
      blogOwnerUserId = userId;
    }

    if (requestRole === RoleEnum.SA) {
      isBanned01 = true;
    }

    const skipSize = paginatedQuery.skipSize;

    let totalCount;
    let blog;

    if (requestRole === RoleEnum.Blogger) {
      totalCount = await this.dataSource.query(
        `SELECT count(*)
       FROM public.blogs b
         left join public.users u on b."ownerId" = u."id"
       LEFT JOIN public.blog_ban_info bbi ON b."id" = bbi."blogId"
       WHERE (bbi."isBanned" = $1 or bbi."isBanned" = $2)
       AND b."name" ILIKE $3 
       AND b."ownerId" = $4;`,
        [isBanned01, isBanned02, searchName, blogOwnerUserId],
      );

      blog = await this.dataSource.query(
        `SELECT b.*, b."ownerId", u."login" as "userLogin", bbi."banDate"
       FROM public.blogs b
         left join public.users u on b."ownerId" = u."id"
       LEFT JOIN public.blog_ban_info bbi ON b."id" = bbi."blogId"
       WHERE (bbi."isBanned" = $1 or bbi."isBanned" = $2)
       AND b."name" ILIKE $3
        AND b."ownerId" = $4
       ORDER BY "${paginatedQuery.sortBy}" ${paginatedQuery.sortDirection}
       LIMIT ${paginatedQuery.pageSize} OFFSET ${skipSize};`,
        [isBanned01, isBanned02, searchName, blogOwnerUserId],
      );
    } else {
      totalCount = await this.dataSource.query(
        `SELECT count(*)
       FROM public.blogs b
         left join public.users u on b."ownerId" = u."id"
       LEFT JOIN public.blog_ban_info bbi ON b.id = bbi."blogId"
       WHERE (bbi."isBanned" = $1 or bbi."isBanned" = $2)
       AND b."name" ILIKE $3;`,
        [isBanned01, isBanned02, searchName],
      );

      blog = await this.dataSource.query(
        `SELECT b.*, b."ownerId", u."login" as "userLogin", bbi."banDate"
       FROM public.blogs b
         left join public.users u on b."ownerId" = u."id"
       LEFT JOIN public.blog_ban_info bbi ON b.id = bbi."blogId"
       WHERE (bbi."isBanned" = $1 or bbi."isBanned" = $2)
       AND b."name" ILIKE $3
       ORDER BY "${paginatedQuery.sortBy}" ${paginatedQuery.sortDirection}
       LIMIT ${paginatedQuery.pageSize} OFFSET ${skipSize};`,
        [isBanned01, isBanned02, searchName],
      );
    }

    let mappedBlog: BlogsViewType[];
    if (requestRole === RoleEnum.SA) {
      mappedBlog = this.blogsMappingForSA(blog);
    } else {
      mappedBlog = this.blogsMapping(blog);
    }

    return {
      pagesCount: paginatedQuery.totalPages(totalCount[0].count),
      page: Number(paginatedQuery.pageNumber),
      pageSize: Number(paginatedQuery.pageSize),
      totalCount: Number(totalCount[0].count),
      items: mappedBlog,
    };
  }
}
