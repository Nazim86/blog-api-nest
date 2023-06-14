import { BlogRepository } from '../../public/blogs/infrastructure/blog.repository';
import { BlogDocument } from '../../../domains/blog.entity';
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
    const blog: BlogDocument = await this.blogRepository.getBlogById(
      command.blogId,
    );
    if (!blog) return { code: ResultCode.NotFound };

    if (blog.blogOwnerInfo.userId !== command.userId)
      return { code: ResultCode.Forbidden };

    blog.updateBlog(command.updateBlogDto);

    await this.blogRepository.save(blog);

    return { code: ResultCode.Success };
  }
}
