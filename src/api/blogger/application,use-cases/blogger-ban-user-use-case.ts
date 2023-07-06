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

      if (command.blogOwnerId !== blog.userId) {
        return { code: ResultCode.Forbidden };
      }

      const bannedUser = await this.usersRepository.bloggerBanUser(
        user.isBanned,
        user.banReason,
        command.userId,
        command.userBanDto,
        blog.id,
      );
      // const bannedUser = await this.usersRepository.findBloggerBannedUser(
      //   command.userId,
      //   command.userBanDto.blogId,
      // );
      //
      // if (!bannedUser) {
      //   const banUser = await this.UserBanModel.createBannedUser(
      //     user.login,
      //     command.userId,
      //     command.userBanDto,
      //     this.UserBanModel,
      //   );
      //   await this.usersRepository.saveBloggerBanUser(banUser);
      //   return { code: ResultCode.Success };
      // }
      //
      // if (bannedUser)
      //   bannedUser.updateBannedUser(
      //     user.accountData.login,
      //     command.userId,
      //     command.userBanDto,
      //   );
      // await this.usersRepository.saveBloggerBanUser(bannedUser);

      // await this.commentsRepository.

      return { code: bannedUser ? ResultCode.Success : ResultCode.NotFound };
    } catch (e) {
      return { code: ResultCode.Success };
    }
  }
}
