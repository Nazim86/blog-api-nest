import { BlogRepository } from '../../../infrastructure/blogs/blog.repository';
import { BlogDocument } from '../../../entities/blog.entity';
import { ResultCode } from '../../../../exception-handler/result-code-enum';
import { BanBlogInputModel } from '../inputModel/banBlog-input-model';
import { Result } from '../../../../exception-handler/result-type';
import { CommandHandler } from '@nestjs/cqrs';

export class BanBlogCommand {
  constructor(public blogId: string, public banStatus: BanBlogInputModel) {}
}

@CommandHandler(BanBlogCommand)
export class BanBlogUseCase {
  constructor(private readonly blogsRepository: BlogRepository) {}
  async execute(command: BanBlogCommand): Promise<Result<any>> {
    const blog: BlogDocument = await this.blogsRepository.getBlogById(
      command.blogId,
    );

    if (!blog) {
      const errorMessage = {
        message: [{ message: 'blog not found', field: 'blogId' }],
      };
      return {
        data: errorMessage,
        code: ResultCode.BadRequest,
      };
    }

    blog.banBlog(command.banStatus.isBanned);

    await this.blogsRepository.save(blog);

    return { code: ResultCode.Success };
  }
}
