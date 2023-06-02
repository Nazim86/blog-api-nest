import { BlogRepository } from '../infrastructure/blog.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument, BlogModelType } from '../domain/blog.entity';
import { CreateBlogDto } from '../createBlog.dto';
import { CommandHandler } from '@nestjs/cqrs';

export class BlogCreateCommand {
  constructor(public createBlogDto: CreateBlogDto) {}
}
@CommandHandler(BlogCreateCommand)
export class BlogCreateUseCase {
  constructor(
    protected blogRepository: BlogRepository,
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
  ) {}

  async execute(command: BlogCreateCommand): Promise<string> {
    const newBlog: BlogDocument = this.BlogModel.createBlog(
      command.createBlogDto,
      this.BlogModel,
    );
    await this.blogRepository.save(newBlog);

    return newBlog.id;
  }
}
