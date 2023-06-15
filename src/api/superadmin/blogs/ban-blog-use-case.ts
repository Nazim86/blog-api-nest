import { BlogRepository } from '../../public/blogs/infrastructure/blog.repository';
import { BlogDocument } from '../../../domains/blog.entity';
import { ResultCode } from '../../../exception-handler/result-code-enum';
import { BanBlogInputModel } from './inputModel/banBlog-input-model';
import { Result } from '../../../exception-handler/result-type';
import { CommandHandler } from '@nestjs/cqrs';

export class BanBlogCommand {
  constructor(public blogId: string, public banStatus: BanBlogInputModel) {}
}

@CommandHandler(BanBlogCommand)
export class BanBlogUseCase {
  constructor(private readonly blogsRepository: BlogRepository) {}
  async execute(command: BanBlogCommand): Promise<Result<ResultCode>> {
    const blog: BlogDocument = await this.blogsRepository.getBlogById(
      command.blogId,
    );

    const errorMessages = [];

    if (!blog) {
      return {
        data: errorMessages.push({
          message: 'blog not found',
          field: 'blogId',
        }),
        code: ResultCode.BadRequest,
      };
    }

    blog.banBlog(command.banStatus.isBanned);

    await this.blogsRepository.save(blog);

    return { code: ResultCode.Success };
  }
}
