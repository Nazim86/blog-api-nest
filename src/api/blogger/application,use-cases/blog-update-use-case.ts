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

    if (blog.ownerId !== command.userId) return { code: ResultCode.Forbidden };

    await this.blogRepository.updateBlog(blog.id, command.updateBlogDto);

    return { code: ResultCode.Success };
  }
}
