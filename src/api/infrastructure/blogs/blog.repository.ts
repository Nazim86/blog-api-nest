import { Injectable } from '@nestjs/common';
import { Blog, BlogDocument, BlogModelType } from '../../entities/blog.entity';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CreateBlogDto } from '../../blogger/inputModel-Dto/createBlog.dto';

@Injectable()
export class BlogRepository {
  constructor(
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async getBlogById(blogId: string): Promise<BlogDocument | null> {
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

  async getBlogByBlogOwnerId(userId: string) {
    return this.BlogModel.find({
      'blogOwnerInfo.userId': userId,
    });
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

  async save(blog: BlogDocument): Promise<BlogDocument> {
    return await blog.save();
  }

  async deleteBlogById(id: string): Promise<boolean> {
    try {
      const result = await this.BlogModel.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount === 1;
    } catch (e) {
      return false;
    }
  }
}
