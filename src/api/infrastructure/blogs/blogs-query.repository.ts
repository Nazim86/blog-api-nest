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
          userId: blog.owner.id,
          userLogin: blog.owner.login,
        },
        banInfo: {
          isBanned: blog.blogBanInfo.isBanned,
          banDate: blog.blogBanInfo.banDate,
        },
      };
    });
  };

  async getBlogById(id: string): Promise<BlogsViewType | boolean> {
    try {
      const foundBlog = await this.blogsRepo
        .createQueryBuilder('b')
        .leftJoinAndSelect('b.owner', 'u')
        .leftJoinAndSelect('b.blogBanInfo', 'bbi')
        .where('b.id = :blogId', { blogId: id })
        .getOne();

      if (!foundBlog || foundBlog.blogBanInfo.isBanned) {
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
        .orWhere('bbi.isBanned = :isBanned01', { isBanned01: isBanned01 })
        .orWhere('bbi.isBanned = :isBanned02', { isBanned02: isBanned02 })
        .andWhere('b.name ILIKE :name ', { name: searchName })
        .andWhere('o.id = :ownerId', { ownerId: blogOwnerUserId })

        //   '(bbi.isBanned = :isBanned01 or bbi.isBanned = :isBanned02)' +
        //     'and b.name ILIKE :name  and o.id = :ownerId',
        //   {
        //     isBanned01: isBanned01,
        //     isBanned02: isBanned02,
        //     name: searchName,
        //     ownerId: blogOwnerUserId,
        //   },
        // )
        .orderBy(`o.${paginatedQuery.sortBy}`, paginatedQuery.sortDirection)
        .skip(skipSize)
        .take(paginatedQuery.pageSize)
        .getManyAndCount();

      // writeSql(blog);
      totalCount = Number(blog[1]);

      blog = blog[0];
    } else {
      blog = await this.blogsRepo
        .createQueryBuilder('b')
        .leftJoinAndSelect('b.owner', 'o')
        .leftJoinAndSelect('b.blogBanInfo', 'bbi')
        .orWhere('bbi.isBanned = :isBanned01', { isBanned01: isBanned01 })
        .orWhere('bbi.isBanned = :isBanned02', { isBanned02: isBanned02 })
        .andWhere('b.name ILIKE :name ', { name: searchName })
        // .where(
        //   '(bbi.isBanned = :isBanned01 or bbi.isBanned = :isBanned02)' +
        //     'and b.name ILIKE :name',
        //   {
        //     isBanned01: isBanned01,
        //     isBanned02: isBanned02,
        //     name: searchName,
        //   },
        // )
        .orderBy(`o.${paginatedQuery.sortBy}`, paginatedQuery.sortDirection)
        .skip(skipSize)
        .take(paginatedQuery.pageSize)
        .getManyAndCount();

      totalCount = Number(blog[1]);

      blog = blog[0];
    }

    // console.log(isBanned01, isBanned02);
    // console.log('blog before map', blog);

    let mappedBlog: BlogsViewType[];

    if (requestRole === RoleEnum.SA) {
      mappedBlog = this.blogsMappingForSA(blog);
    } else {
      mappedBlog = this.blogsMapping(blog);
    }

    // console.log('blog after map', mappedBlog);

    return {
      pagesCount: paginatedQuery.totalPages(totalCount),
      page: Number(paginatedQuery.pageNumber),
      pageSize: Number(paginatedQuery.pageSize),
      totalCount: Number(totalCount),
      items: mappedBlog,
    };
  }
}
