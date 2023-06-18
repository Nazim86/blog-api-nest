import { CommandHandler } from '@nestjs/cqrs';
import { BlogDocument } from '../../entities/blog.entity';
import { BlogRepository } from '../../infrastructure/blogs/blog.repository';
import { ResultCode } from '../../../exception-handler/result-code-enum';
import { Result } from '../../../exception-handler/result-type';

export class BlogDeleteCommand {
  constructor(public userId: string, public blogId: string) {}
}

@CommandHandler(BlogDeleteCommand)
export class BlogDeleteUseCase {
  constructor(private readonly blogRepository: BlogRepository) {}

  async execute(command: BlogDeleteCommand): Promise<Result<ResultCode>> {
    const blog: BlogDocument = await this.blogRepository.getBlogById(
      command.blogId,
    );

    if (!blog) return { code: ResultCode.NotFound };

    if (blog.blogOwnerInfo.userId !== command.userId)
      return { code: ResultCode.Forbidden };

    const isBlogDeleted = await this.blogRepository.deleteBlogById(
      command.blogId,
    );

    return { code: isBlogDeleted ? ResultCode.Success : ResultCode.NotFound };
  }
}
