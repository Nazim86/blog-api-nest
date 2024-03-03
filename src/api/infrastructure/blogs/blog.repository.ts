import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blogs } from '../../entities/blogs/blogs.entity';
import { BlogBanInfo } from '../../entities/blogs/blogBanInfo.entity';
import { BlogWallpaperImage } from '../../entities/blogs/blogWallpaperImage.entity';
import { BlogMainImage } from '../../entities/blogs/blogMainImage.entity';

@Injectable()
export class BlogRepository {
  constructor(
    @InjectRepository(Blogs) private readonly blogsRepo: Repository<Blogs>,
    @InjectRepository(BlogBanInfo)
    private readonly blogBanInfoRepo: Repository<BlogBanInfo>,
    @InjectRepository(BlogWallpaperImage)
    private readonly blogWallpaperRepo: Repository<BlogWallpaperImage>,
    @InjectRepository(BlogMainImage)
    private readonly blogMainImageRepo: Repository<BlogMainImage>,
  ) {}

  async saveBlog(blog: Blogs) {
    return this.blogsRepo.save(blog);
  }

  async saveBlogBanInfo(blogBanInfo: BlogBanInfo) {
    return this.blogBanInfoRepo.save(blogBanInfo);
  }

  async getBlogById(blogId: string) {
    try {
      const foundBlog = await this.blogsRepo
        .createQueryBuilder('b')
        .leftJoinAndSelect('b.owner', 'o')
        .leftJoinAndSelect('b.blogBanInfo', 'bbi')
        .where('b.id = :id', { id: blogId })
        .getOne();

      if (!foundBlog) {
        return null;
      }
      return foundBlog;
    } catch (e) {
      console.log('error', e);
      return null;
    }
  }

  async findWallpaper(blogId: string): Promise<BlogWallpaperImage> {
    return this.blogWallpaperRepo
      .createQueryBuilder('bw')
      .leftJoinAndSelect('bw.blogs', 'b')
      .where('b.id = :id', { id: blogId })
      .getOne();
  }
  async findImages(blogId: string): Promise<BlogMainImage[]> {
    return this.blogMainImageRepo
      .createQueryBuilder('bm')
      .leftJoinAndSelect('bm.blogs', 'b')
      .where('b.id = :id', { id: blogId })
      .getMany();
  }

  async saveWallpaperData(wallpaperData: BlogWallpaperImage) {
    return this.blogWallpaperRepo.save(wallpaperData);
  }
  async saveMainImage(mainImage: BlogMainImage) {
    return this.blogMainImageRepo.save(mainImage);
  }

  // async bindBlogWithUser(userId: string, login: string, blogId: string) {
  //   const isBound = await this.dataSource.query(
  //     `UPDATE public.blog_owner_info
  //       SET "userId"=$1, "userLogin"=$2
  //       WHERE "blogId"=$3`,
  //     [userId, login, blogId],
  //   );
  //
  //   return isBound[1] === 1;
  // }

  async deleteBlogById(id: string): Promise<boolean> {
    try {
      const result = await this.blogsRepo
        .createQueryBuilder('b')
        .delete()
        .from(Blogs)
        .where('id = :blogId', { blogId: id })
        .execute();

      return result.affected === 1;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
