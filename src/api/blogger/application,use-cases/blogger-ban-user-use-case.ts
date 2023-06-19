import { UserBanDto } from '../inputModel-Dto/userBan.dto';
import { CommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import {
  BloggerBanUser,
  BloggerBanUserDocument,
  BloggerBanUserModelType,
} from '../../entities/user-ban-by-blogger.entity';
import { UsersRepository } from '../../infrastructure/users/users.repository';
import { ResultCode } from '../../../exception-handler/result-code-enum';
import { UserDocument } from '../../entities/user.entity';
import { BlogRepository } from '../../infrastructure/blogs/blog.repository';

export class BloggerBanUserCommand {
  constructor(public userId: string, public userBanDto: UserBanDto) {}
}

@CommandHandler(BloggerBanUserCommand)
export class BloggerBanUserUseCase {
  constructor(
    @InjectModel(BloggerBanUser.name)
    private UserBanModel: BloggerBanUserModelType,
    private readonly usersRepository: UsersRepository,
    private readonly blogsRepository: BlogRepository,
  ) {}
  async execute(command: BloggerBanUserCommand) {
    try {
      const user: UserDocument = await this.usersRepository.findUserById(
        command.userId,
      );

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

      // if (command.blogOwnerId !== blog.blogOwnerInfo.userId) {
      //   return { code: ResultCode.Forbidden };
      // }

      const bannedUser: BloggerBanUserDocument =
        await this.usersRepository.findBloggerBannedUser(
          command.userId,
          command.userBanDto.blogId,
        );

      if (!bannedUser) {
        const banUser = await this.UserBanModel.createBannedUser(
          user.accountData.login,
          command.userId,
          command.userBanDto,
          this.UserBanModel,
        );
        await this.usersRepository.saveBloggerBanUser(banUser);
        return { code: ResultCode.Success };
      }

      if (bannedUser)
        bannedUser.updateBannedUser(
          user.accountData.login,
          command.userId,
          command.userBanDto,
        );
      console.log(bannedUser, 'before update ban status');
      await this.usersRepository.saveBloggerBanUser(bannedUser);

      return { code: ResultCode.Success };
    } catch (e) {
      console.log(e);
      return { code: ResultCode.Success };
    }
  }
}
