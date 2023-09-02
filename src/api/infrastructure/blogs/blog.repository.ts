import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Blogs } from '../../entities/blogs/blogs.entity';
import { BlogBanInfo } from '../../entities/blogs/blogBanInfo.entity';

@Injectable()
export class BlogRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(Blogs) private readonly blogsRepo: Repository<Blogs>,
    @InjectRepository(BlogBanInfo)
    private readonly blogBanInfoRepo: Repository<BlogBanInfo>,
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
