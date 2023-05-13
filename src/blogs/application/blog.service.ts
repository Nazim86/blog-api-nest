import { Injectable } from '@nestjs/common';
import { BlogRepository } from '../infrastructure/blog.repository';
import { BlogsViewType } from '../infrastructure/types/blogs-view-type';

import { CreateBlogDto } from '../createBlog.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument, BlogModelType } from '../domain/blog.entity';

@Injectable()
export class BlogService {
  constructor(
    protected blogRepository: BlogRepository,
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
  ) {}

  async createBlog(createBlogDto: CreateBlogDto): Promise<string> {
    const newBlog: BlogDocument = this.BlogModel.createBlog(
      createBlogDto,
      this.BlogModel,
    );
    await this.blogRepository.save(newBlog);

    return newBlog.id;
  }

  async getBlog(): Promise<BlogsViewType[]> {
    return await this.blogRepository.getBlog();
  }

  async getBlogById(id: string): Promise<BlogDocument | null> {
    return await this.blogRepository.getBlogById(id);
  }

  async updateBlog(
    blogId: string,
    updateBlogDto: CreateBlogDto,
  ): Promise<BlogDocument | null> {
    const blog: BlogDocument = await this.blogRepository.getBlogById(blogId);

    if (!blog) return null;

    blog.updateBlog(updateBlogDto);

    return await this.blogRepository.save(blog);
  }

  async deleteBlogById(blogId: string): Promise<boolean> {
    return await this.blogRepository.deleteBlogById(blogId);
  }
}
