import { Injectable } from '@nestjs/common';
import { BlogRepository } from './blog.repository';
import { BlogsViewType } from './types/blogs-view-type';

import { CreateBlogDto } from './createBlog.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument, BlogModelType } from './blog.entity';

@Injectable()
export class BlogService {
  constructor(
    protected blogRepository: BlogRepository,
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
  ) {}

  async createBlog(createBlogDto: CreateBlogDto): Promise<BlogsViewType> {
    const newBlog: BlogDocument = this.BlogModel.createBlog(
      createBlogDto,
      this.BlogModel,
    );
    return this.blogRepository.createBlog(newBlog);
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
