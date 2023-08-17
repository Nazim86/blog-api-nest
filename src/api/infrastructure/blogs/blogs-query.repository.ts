import { BlogsViewType } from './types/blogs-view-type';
import { Injectable } from '@nestjs/common';
import { QueryPaginationType } from '../../../types/query-pagination-type';
import { PaginationType } from '../../../common/pagination';
import { BlogPagination } from './blog-pagination';
import { RoleEnum } from '../../../enums/role-enum';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Blogs } from '../../entities/blogs/blogs.entity';

@Injectable()
export class BlogsQueryRepo {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(Blogs) private readonly blogsRepo: Repository<Blogs>,
  ) {}

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
          userId: blog.ownerId,
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
        `SELECT b.*, u."login", bbi."banDate", bbi."isBanned" 
        FROM public.blogs b 
        Left join public.users u on b."owner" = u."id"
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
      blog = await this.blogsRepo
        .createQueryBuilder('b')
        .leftJoinAndSelect('b.owner', 'o')
        .leftJoinAndSelect('b.blogBanInfo', 'bbi')
        .where(
          '(bbi.isBanned = :isBanned01 or bbi.isBanned = :isBanned02)' +
            'and b.name ILIKE :name  and b.owner = :ownerId',
          {
            isBanned01: isBanned01,
            isBanned02: isBanned02,
            name: searchName,
            owner: blogOwnerUserId,
          },
        )
        .orderBy(`o.${paginatedQuery.sortBy}`, paginatedQuery.sortDirection)
        .skip(skipSize)
        .take(paginatedQuery.pageSize)
        .getManyAndCount();

      totalCount = Number(blog[1]);

      blog = blog[0];
    } else {
      blog = await this.blogsRepo
        .createQueryBuilder('b')
        .leftJoinAndSelect('b.owner', 'o')
        .leftJoinAndSelect('b.blogBanInfo', 'bbi')
        .where(
          '(bbi.isBanned = :isBanned01 or bbi.isBanned = :isBanned02)' +
            'and b.name ILIKE :name',
          {
            isBanned01: isBanned01,
            isBanned02: isBanned02,
            name: searchName,
          },
        )
        .orderBy(`o.${paginatedQuery.sortBy}`, paginatedQuery.sortDirection)
        .skip(skipSize)
        .take(paginatedQuery.pageSize)
        .getManyAndCount();

      totalCount = Number(blog[1]);

      blog = blog[0];
    }

    let mappedBlog: BlogsViewType[];

    if (requestRole === RoleEnum.SA) {
      mappedBlog = this.blogsMappingForSA(blog);
    } else {
      mappedBlog = this.blogsMapping(blog);
    }

    return {
      pagesCount: paginatedQuery.totalPages(totalCount),
      page: Number(paginatedQuery.pageNumber),
      pageSize: Number(paginatedQuery.pageSize),
      totalCount: Number(totalCount),
      items: mappedBlog,
    };
  }
}
