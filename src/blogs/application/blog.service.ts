import { Injectable } from '@nestjs/common';
import { BlogRepository } from '../infrastructure/blog.repository';

import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from '../domain/blog.entity';

@Injectable()
export class BlogService {
  constructor(
    protected blogRepository: BlogRepository,
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
  ) {}

  async deleteBlogById(blogId: string): Promise<boolean> {
    return await this.blogRepository.deleteBlogById(blogId);
  }
}
