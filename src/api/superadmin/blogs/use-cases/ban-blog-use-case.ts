import { BlogRepository } from '../../../infrastructure/blogs/blog.repository';
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
    const blog = await this.blogsRepository.getBlogById(command.blogId);

    if (!blog) {
      const errorMessage = {
        message: [{ message: 'blog not found', field: 'blogId' }],
      };
      return {
        data: errorMessage,
        code: ResultCode.BadRequest,
      };
    }

    blog.blogBanInfo.isBanned = command.banStatus.isBanned;
    blog.blogBanInfo.banDate = new Date();

    const isBanned = await this.blogsRepository.saveBlogBanInfo(
      blog.blogBanInfo,
    );

    // const isBanned = await this.blogsRepository.banBlog(
    //   command.banStatus.isBanned,
    //   blog.id,
    // );
    //blog.banBlog(command.banStatus.isBanned);

    return { code: isBanned ? ResultCode.Success : ResultCode.NotFound };
  }
}
