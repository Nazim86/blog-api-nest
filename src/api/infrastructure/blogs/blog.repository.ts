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
        `SELECT b.*, boi."userId",boi."userLogin", bbi."banDate" 
        FROM public.blogs b Left join public.blog_owner_info boi on b."id" = boi."blogId" 
        Left join public.blog_ban_info bbi on b."id" = bbi."blogId" where b."id" = $1 ;`,
        [blogId],
      );

      foundBlog = foundBlog[0];

      if (!foundBlog) {
        return null;
      }
      return foundBlog;
    } catch (e) {
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
         name, description, "websiteUrl", "createdAt", "isMembership", "isBanned")
         VALUES ( $1, $2, $3, $4, $5, $6) returning id;`,
      [
        createBlogDto.name,
        createBlogDto.description,
        createBlogDto.websiteUrl,
        new Date().toISOString(),
        false,
        false,
      ],
    );

    await this.dataSource.query(
      `INSERT INTO public.blog_owner_info(
            "blogId", "userId", "userLogin")
            VALUES ($1, $2, $3);`,
      [newBlog[0].id, userId, login],
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
    const result1 = await this.dataSource.query(
      `UPDATE public.blogs
    SET "isBanned"=$1
    WHERE "id" = $2;`,
      [isBanned, blogId],
    );

    const result2 = await this.dataSource.query(
      `UPDATE public.blog_ban_info
            SET "isBanned"=$1, "banDate"=$2
            WHERE "blogId"=$3;`,
      [isBanned, new Date().toISOString(), blogId],
    );

    return result1[1] && result2[1] === 1;
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
      `UPDATE public.blog_owner_info bo
    SET  "userId"=null, "userLogin"=null
    WHERE bo."userId" = $1;`,
      [userId],
    );

    //   await this.BlogModel.updateMany(
    //   { 'blogOwnerInfo.userId': userId },
    //   {
    //     $set: { 'blogOwnerInfo.userId': null, 'blogOwnerInfo.userLogin': null },
    //   },
    // );
    return result[1] === 1;
  }

  async deleteBlogById(id: string): Promise<boolean> {
    try {
      const result = await this.dataSource.query(
        `DELETE FROM public.blogs
               WHERE "id" = $1;`,
        [id],
      );
      //const result = await this.BlogModel.deleteOne({ _id: new ObjectId(id) });
      return result[1] === 1;
    } catch (e) {
      return false;
    }
  }
}
