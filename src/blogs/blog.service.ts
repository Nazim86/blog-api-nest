import { Injectable } from '@nestjs/common';
import { BlogRepository } from './blog.repository';
import { BlogsViewType } from './types/blogs-view-type';

import { CreateBlogDto } from './createBlog.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from './blog.entity';

@Injectable()
export class BlogService {
  constructor(
    protected blogRepository: BlogRepository,
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
  ) {}

  async createBlog(createBlogDto: CreateBlogDto): Promise<BlogsViewType> {
    const newBlog = this.BlogModel.createBlog(createBlogDto, this.BlogModel);
    return this.blogRepository.createBlog(newBlog);
  }

  async getBlog(): Promise<BlogsViewType[]> {
    return await this.blogRepository.getBlog();
  }

  async getBlogById(id: string): Promise<BlogsViewType | null> {
    return await this.blogRepository.getBlogById(id);
  }

  async updateBlog(
    id: string,
    name: string,
    description: string,
    websiteUrl: string,
  ): Promise<boolean> {
    return await this.blogRepository.updateBlog(
      id,
      name,
      description,
      websiteUrl,
    );
  }

  async deleteBlogById(id: string): Promise<boolean> {
    return await this.blogRepository.deleteBlogById(id);
  }
}
