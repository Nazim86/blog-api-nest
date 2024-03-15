import { BlogsViewType } from './types/blogs-view-type';
import { Injectable } from '@nestjs/common';
import { QueryPaginationType } from '../../../types/query-pagination-type';
import { PaginationType } from '../../../common/pagination';
import { BlogPagination } from './blog-pagination';
import { RoleEnum } from '../../../enums/role-enum';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blogs } from '../../entities/blogs/blogs.entity';
import { BlogWallpaperImage } from '../../entities/blogs/blogWallpaperImage.entity';
import { BlogMainImage } from '../../entities/blogs/blogMainImage.entity';

@Injectable()
export class BlogsQueryRepo {
  constructor(
    @InjectRepository(Blogs) private readonly blogsRepo: Repository<Blogs>,
    @InjectRepository(BlogMainImage)
    private readonly blogMainRepo: Repository<BlogMainImage>,
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

  private blogImages = (
    wallpaper: BlogWallpaperImage,
    mainImages: BlogMainImage[],
  ) => {
    const wallpaperImage = wallpaper
      ? {
          // id: wallpaper.id,
          url: wallpaper.url,
          width: wallpaper.width,
          height: wallpaper.height,
          fileSize: wallpaper.fileSize,
        }
      : null;
    return {
      wallpaper: wallpaperImage,
      main:
        mainImages.map((mainImage) => {
          return {
            url: mainImage.url,
            width: mainImage.width,
            height: mainImage.height,
            fileSize: mainImage.fileSize,
          };
        }) ?? null,
    };
  };

  async getImages(blogId: string) {
    const blog: Blogs = await this.blogsRepo
      .createQueryBuilder('b')
      // .addSelect(
      //   (qb) =>
      //     qb
      //       .select('json_agg(mainImage)', 'image_urls')
      //       .from(BlogMainImage, 'mi')
      //       .where('mi.blogs.id = b.id'),
      //   'blog_main_images',
      // )
      .leftJoinAndSelect('b.wallpaperImage', 'bw')
      .where('b.id = :blogId', { blogId })
      .getOne();

    const blogMainImages: BlogMainImage[] = await this.blogMainRepo
      .createQueryBuilder('bm')
      //.leftJoinAndSelect('bm.blogs', 'b')
      .where('bm.blogs = :blogId', { blogId })
      .getMany();

    // .createQueryBuilder('blog')
    //     .leftJoinAndSelect('blog.images', 'images')
    //     .select('json_agg(images.url)', 'image_urls')
    //     .where('blog.id = :blogId', { blogId })
    //     .groupBy('blog.id')
    //     .getRawOne();

    //console.log('blog in getImages', blogMainImages);

    return this.blogImages(blog.wallpaperImage, blogMainImages);
  }

  async getBlogById(id: string): Promise<BlogsViewType | boolean> {
    try {
      const foundBlog = await this.blogsRepo
        .createQueryBuilder('b')
        .leftJoinAndSelect('b.owner', 'u')
        .leftJoinAndSelect('b.blogBanInfo', 'bbi')
        .leftJoinAndSelect('b.wallpaperImage', 'bw')
        .leftJoinAndSelect('b.mainImage', 'bm')
        .where('b.id = :blogId', { blogId: id })
        .getOne();

      const blogMainImages: BlogMainImage[] = await this.blogMainRepo
        .createQueryBuilder('bm')
        .where('bm.blogs = :blogId', { blogId: id })
        .getMany();

      if (!foundBlog || foundBlog.blogBanInfo.isBanned) {
        return false;
      }

      // console.log('foundBlog in getBlogById', foundBlog);
      // console.log('blogMainImage in getBlogById', blogMainImages);

      const images = this.blogImages(foundBlog.wallpaperImage, blogMainImages);

      return {
        id: foundBlog.id,
        name: foundBlog.name,
        description: foundBlog.description,
        websiteUrl: foundBlog.websiteUrl,
        createdAt: foundBlog.createdAt,
        isMembership: foundBlog.isMembership,
        images: images,
      };
    } catch (e) {
      console.log('e in getBlogById blogquery', e);
      return false;
    }
  }

  async getBlog(
    query: BlogPagination<PaginationType>,
    requestRole?: RoleEnum,
    userId?: string,
  ): Promise<QueryPaginationType<BlogsViewType[]>> {
    let searchName = '%';
    let isBanned01 = null;
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

    if (requestRole !== RoleEnum.SA) {
      isBanned01 = false;
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
          `${
            isBanned01 === true || isBanned01 === false
              ? 'bbi.isBanned = :banStatus'
              : 'bbi.isBanned is not null'
          }`,
          { banStatus: isBanned01 },
        )
        .andWhere('b.name ILIKE :name ', { name: searchName })
        .andWhere('o.id = :ownerId', { ownerId: blogOwnerUserId })
        .orderBy(`b.${paginatedQuery.sortBy}`, paginatedQuery.sortDirection)
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
        .where(
          `${
            isBanned01 === true || isBanned01 === false
              ? 'bbi.isBanned = :banStatus'
              : 'bbi.isBanned is not null'
          }`,
          { banStatus: isBanned01 },
        )
        .andWhere('b.name ILIKE :name ', { name: searchName })
        .orderBy(`b.${paginatedQuery.sortBy}`, paginatedQuery.sortDirection)
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
