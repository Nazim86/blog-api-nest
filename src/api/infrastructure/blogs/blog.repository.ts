import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CreateBlogDto } from '../../blogger/inputModel-Dto/createBlog.dto';

@Injectable()
export class BlogRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getBlogById(blogId: string) {
    try {
      let foundBlog = await this.dataSource.query(
        `SELECT b.*, u."login",ubb."isBanned"
         FROM public.blogs b 
         left join public.users u on b."ownerId" = u."id"
         left join public.users_ban_by_sa ubb on
         u."id" = ubb."userId"
         where b."id" = $1;`,
        [blogId],
      );

      foundBlog = foundBlog[0];

      if (!foundBlog) {
        return null;
      }
      return foundBlog;
    } catch (e) {
      console.log('error', e);
      return null;
    }
  }

  async createBlog(
    userId: string,
    login: string,
    createBlogDto: CreateBlogDto,
  ) {
    const newBlog = await this.dataSource.query(
      `INSERT INTO public.blogs(
         name, description, "websiteUrl", "createdAt", "isMembership","ownerId")
         VALUES ( $1, $2, $3, $4, $5,$6) returning id;`,
      [
        createBlogDto.name,
        createBlogDto.description,
        createBlogDto.websiteUrl,
        new Date().toISOString(),
        false,
        userId,
      ],
    );

    await this.dataSource.query(
      `INSERT INTO public.blog_ban_info(
         "isBanned", "banDate", "blogId")
          VALUES ( $1,$2,$3);`,
      [false, null, newBlog[0].id],
    );

    return newBlog[0].id;
  }

  async updateBlog(blogId: string, updateBlogDto: CreateBlogDto) {
    const result = await this.dataSource.query(
      `UPDATE public.blogs b
    SET  name=$1, description=$2, "websiteUrl"=$3
    WHERE b."id" = $4;`,
      [
        updateBlogDto.name,
        updateBlogDto.description,
        updateBlogDto.websiteUrl,
        blogId,
      ],
    );
    return result[1] === 1;
  }

  async banBlog(isBanned: boolean, blogId: string) {
    const result = await this.dataSource.query(
      `UPDATE public.blog_ban_info
            SET "isBanned"=$1, "banDate"=$2
            WHERE "blogId"=$3;`,
      [isBanned, new Date().toISOString(), blogId],
    );

    return result[1] === 1;
  }

  async bindBlogWithUser(userId: string, login: string, blogId: string) {
    const isBound = await this.dataSource.query(
      `UPDATE public.blog_owner_info
        SET "userId"=$1, "userLogin"=$2
        WHERE "blogId"=$3`,
      [userId, login, blogId],
    );

    return isBound[1] === 1;
  }

  async deleteBlogOwnerInfo(userId: string) {
    const result = await this.dataSource.query(
      `UPDATE public.blogs 
    SET  "ownerId"=null
    WHERE "ownerId" = $1;`,
      [userId],
    );

    return result[1] === 1;
  }

  async deleteBlogById(id: string): Promise<boolean> {
    try {
      const result = await this.dataSource.query(
        `DELETE FROM public.blogs
               WHERE "id" = $1;`,
        [id],
      );

      return result[1] === 1;
    } catch (e) {
      return false;
    }
  }
}
