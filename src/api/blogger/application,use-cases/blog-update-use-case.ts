import { BlogRepository } from '../../public/blogs/infrastructure/blog.repository';
import { BlogDocument } from '../../../domains/blog.entity';
import { CreateBlogDto } from '../createBlog.dto';
import { CommandHandler } from '@nestjs/cqrs';

export class BlogUpdateCommand {
  constructor(
    public userId: string,
    public blogId: string,
    public updateBlogDto: CreateBlogDto,
  ) {}
}

@CommandHandler(BlogUpdateCommand)
export class BlogUpdateUseCase {
  constructor(private readonly blogRepository: BlogRepository) {}

  async execute(command: BlogUpdateCommand): Promise<BlogDocument | null> {
    const blog: BlogDocument = await this.blogRepository.getBlogByIdAndUserId(
      command.userId,
      command.blogId,
    );

    if (!blog) return null;

    blog.updateBlog(command.updateBlogDto);

    return await this.blogRepository.save(blog);
  }
}
