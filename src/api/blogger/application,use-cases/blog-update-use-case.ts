import { BlogRepository } from '../../infrastructure/blogs/blog.repository';
import { CreateBlogDto } from '../inputModel-Dto/createBlog.dto';
import { CommandHandler } from '@nestjs/cqrs';
import { ResultCode } from '../../../exception-handler/result-code-enum';
import { Result } from '../../../exception-handler/result-type';

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

  async execute(command: BlogUpdateCommand): Promise<Result<ResultCode>> {
    const blog = await this.blogRepository.getBlogById(command.blogId);
    if (!blog) return { code: ResultCode.NotFound };

    if (blog.owner.id !== command.userId) return { code: ResultCode.Forbidden };

    blog.name = command.updateBlogDto.name;
    blog.description = command.updateBlogDto.description;
    blog.websiteUrl = command.updateBlogDto.websiteUrl;

    const isBlogUpdated = await this.blogRepository.saveBlog(blog);

    return { code: isBlogUpdated ? ResultCode.Success : ResultCode.NotFound };
  }
}
