import { BlogRepository } from '../infrastructure/blog.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument, BlogModelType } from '../domain/blog.entity';
import { CreateBlogDto } from '../createBlog.dto';
import { CommandHandler } from '@nestjs/cqrs';

export class BlogUpdateCommand {
  constructor(public blogId: string, public updateBlogDto: CreateBlogDto) {}
}

@CommandHandler(BlogUpdateCommand)
export class BlogUpdateUseCase {
  constructor(
    protected blogRepository: BlogRepository,
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
  ) {}

  async execute(command: BlogUpdateCommand): Promise<BlogDocument | null> {
    const blog: BlogDocument = await this.blogRepository.getBlogById(
      command.blogId,
    );

    if (!blog) return null;

    blog.updateBlog(command.updateBlogDto);

    return await this.blogRepository.save(blog);
  }
}
