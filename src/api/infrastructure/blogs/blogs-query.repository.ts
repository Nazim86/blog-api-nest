import { BlogsViewType } from './types/blogs-view-type';
import { Injectable } from '@nestjs/common';
import { QueryPaginationType } from '../../../types/query-pagination-type';
import { PaginationType } from '../../../common/pagination';
import { BlogPagination } from './blog-pagination';
import { RoleEnum } from '../../../enums/role-enum';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blogs } from '../../entities/blogs/blogs.entity';
import { BlogMainImage } from '../../entities/blogs/blogMainImage.entity';
import { SubscribeBlog } from '../../entities/blogs/subscribeBlog.entity';
import { Subscription } from '../../../enums/subscription-enum';

@Injectable()
export class BlogsQueryRepo {
  constructor(
    @InjectRepository(Blogs) private readonly blogsRepo: Repository<Blogs>,
    @InjectRepository(BlogMainImage)
    private readonly blogMainRepo: Repository<BlogMainImage>,
  ) {}

  private blogsMapping = (array, mainImages): BlogsViewType[] => {
    let mainImagesForBlog: BlogMainImage[];

    return array.map((blog) => {
      if (mainImages) {
        mainImagesForBlog = mainImages.filter(
          (image) => image.blogs.id === blog.id,
        );
      }
      return {
        id: blog.id,
        name: blog.name,
        description: blog.description,
        websiteUrl: blog.websiteUrl,
        createdAt: blog.createdAt,
        isMembership: blog.isMembership,
        images: {
          wallpaper: blog.wallpaper
            ? {
                url: blog.wallpaperImage.url,
                width: blog.wallpaperImage.width,
                height: blog.wallpaperImage.height,
                fileSize: blog.wallpaperImage.fileSize,
              }
            : null,
          main: mainImagesForBlog
            ? mainImagesForBlog.map((image) => {
                return {
                  url: image.url,
                  width: image.width,
                  height: image.height,
                  fileSize: image.fileSize,
                };
              })
            : [],
        },
      };
    });
  };

  private blogsMappingForSA = (array, mainImages) => {
    return array.map((blog) => {
      const mainImagesForBlog = mainImages.filter(
        (image) => image.blogs === blog.id,
      );
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
        images: {
          wallpaper: {
            url: blog.wallpaperImage.url,
            width: blog.wallpaperImage.width,
            height: blog.wallpaperImage.height,
            fileSize: blog.wallpaperImage.fileSize,
          },
          main: mainImagesForBlog
            ? mainImagesForBlog.map((image) => {
                return {
                  url: image.url,
                  width: image.width,
                  height: image.height,
                  fileSize: image.fileSize,
                };
              })
            : [],
        },
      };
    });
  };

  private blogImages = (blog, mainImages: BlogMainImage[]) => {
    const wallpaperImage = blog.bw_url
      ? {
          // id: wallpaper.id,
          url: blog.bw_url,
          width: blog.bw_width,
          height: blog.bw_height,
          fileSize: blog.bw_fileSize,
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
      .getRawOne();

    const blogMainImages: BlogMainImage[] = await this.blogMainRepo
      .createQueryBuilder('bm')
      .where('bm.blogs = :blogId', { blogId })
      .getMany();

    return this.blogImages(blog, blogMainImages);
  }

  async getBlogById(
    blogId: string,
    userId?: string,
  ): Promise<BlogsViewType | boolean> {
    try {
      const foundBlog: any = await this.blogsRepo
        .createQueryBuilder('b')
        .leftJoinAndSelect('b.owner', 'u')
        .leftJoinAndSelect('b.blogBanInfo', 'bbi')
        .leftJoinAndSelect('b.wallpaperImage', 'bw')
        .addSelect(
          (qb) =>
            qb
              .select('sb.status')
              .from(SubscribeBlog, 'sb')
              .where('sb.blogId = b.id')
              .andWhere('sb.userId = :userId', { userId: userId }),
          'subscribe_status',
        )
        .addSelect(
          (qb) =>
            qb
              .select('count(*)')
              .from(SubscribeBlog, 'sb')
              .where('sb.blogId = :blogId', { blogId })
              .andWhere('sb.status = :status', {
                status: Subscription.Subscribed,
              }),
          'subscribersCount',
        )
        //.loadRelationCountAndMap('b.subscribersCount', 'b.subscribeBlog')
        // .leftJoinAndMapOne(
        //   'b.blogSubscribed',
        //   'b.subscribeBlog',
        //   'sb',
        //   'sb.userId= :userId',
        //   { userId },
        // )
        .leftJoinAndSelect('b.mainImage', 'bm')
        .where('b.id = :blogId', { blogId })
        .getRawOne();

      console.log('foundBlog in getBlogById blogquery', foundBlog);

      const blogMainImages: BlogMainImage[] = await this.blogMainRepo
        .createQueryBuilder('bm')
        .where('bm.blogs = :blogId', { blogId })
        .getMany();

      if (!foundBlog || foundBlog.bbi_isBanned) {
        return false;
      }

      const images = this.blogImages(foundBlog, blogMainImages);

      return {
        id: foundBlog.b_id,
        name: foundBlog.b_name,
        description: foundBlog.b_description,
        websiteUrl: foundBlog.b_websiteUrl,
        createdAt: foundBlog.b_createdAt,
        isMembership: foundBlog.b_isMembership,
        images: images,
        currentUserSubscriptionStatus: foundBlog.subscribe_status
          ? foundBlog.subscribe_status
          : Subscription.None,
        subscribersCount: Number(foundBlog.subscribersCount),
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
        .leftJoinAndSelect('b.wallpaperImage', 'bw')
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
        .leftJoinAndSelect('b.wallpaperImage', 'bw')
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

    const blogMainImages: BlogMainImage[] = await this.blogMainRepo
      .createQueryBuilder('bm')
      .leftJoinAndSelect('bm.blogs', 'b')
      //.where('bm.blogs = :blogId', { blogId: blog[0].id })
      .getMany();

    let mappedBlog: BlogsViewType[];

    if (requestRole === RoleEnum.SA) {
      mappedBlog = this.blogsMappingForSA(blog, blogMainImages);
    } else {
      mappedBlog = this.blogsMapping(blog, blogMainImages);
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
