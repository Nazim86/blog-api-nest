import { UserBanDto } from '../inputModel-Dto/userBan.dto';
import { CommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infrastructure/users/users.repository';
import { ResultCode } from '../../../exception-handler/result-code-enum';
import { BlogRepository } from '../../infrastructure/blogs/blog.repository';

export class BloggerBanUserCommand {
  constructor(
    public blogOwnerId: string,
    public userId: string,
    public userBanDto: UserBanDto,
  ) {}
}

@CommandHandler(BloggerBanUserCommand)
export class BloggerBanUserUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly blogsRepository: BlogRepository,
  ) {}
  async execute(command: BloggerBanUserCommand) {
    try {
      const user = await this.usersRepository.findUserById(command.userId);

      if (!user) {
        return { code: ResultCode.NotFound };
      }

      const blog = await this.blogsRepository.getBlogById(
        command.userBanDto.blogId,
      );

      if (!blog) {
        const errorsMessages = {
          message: [{ message: 'blog not found', field: 'blogId' }],
        };
        return { data: errorsMessages, code: ResultCode.BadRequest };
      }

      if (command.blogOwnerId !== blog.owner.id) {
        return { code: ResultCode.Forbidden };
      }

      if (command.userBanDto.isBanned) {
        user.usersBanByBlogger.isBanned = command.userBanDto.isBanned;
        user.usersBanByBlogger.banDate = new Date().toISOString();
        user.usersBanByBlogger.banReason = command.userBanDto.banReason;
        user.usersBanByBlogger.blog = blog;
      } else {
        user.usersBanByBlogger.isBanned = false;
        user.usersBanByBlogger.banDate = null;
        user.usersBanByBlogger.banReason = null;
      }

      await this.usersRepository.saveUsersBanByBlogger(user.usersBanByBlogger);

      return { code: user ? ResultCode.Success : ResultCode.NotFound };
    } catch (e) {
      return { code: ResultCode.Success };
    }
  }
}
