import { UserBanDto } from '../inputModel-Dto/userBan.dto';
import { CommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import {
  UserBanByBlogger,
  UserBanByBloggerDocument,
  UserBanByBloggerModelType,
} from '../../../domains/user-ban-by-blogger.entity';
import { UsersRepository } from '../../superadmin/users/infrastructure/users.repository';
import { ResultCode } from '../../../exception-handler/result-code-enum';
import { UserDocument } from '../../../domains/user.entity';
import { BlogRepository } from '../../public/blogs/infrastructure/blog.repository';

export class UserBanByBloggerCommand {
  constructor(public userId: string, public userBanDto: UserBanDto) {}
}

@CommandHandler(UserBanByBloggerCommand)
export class UserBanByBloggerUseCase {
  constructor(
    @InjectModel(UserBanByBlogger.name)
    private UserBanModel: UserBanByBloggerModelType,
    private readonly usersRepository: UsersRepository,
    private readonly blogsRepository: BlogRepository,
  ) {}
  async execute(command: UserBanByBloggerCommand) {
    const user: UserDocument = await this.usersRepository.findUserById(
      command.userId,
    );
    const blog = await this.blogsRepository.getBlogById(
      command.userBanDto.blogId,
    );

    const errorsMessages = [];

    if (!blog) {
      errorsMessages.push({ message: 'blog not found', field: 'blogId' });
      return { data: errorsMessages, code: ResultCode.BadRequest };
    }

    const bannedUser: UserBanByBloggerDocument =
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

    bannedUser.updateBannedUser(
      user.accountData.login,
      command.userId,
      command.userBanDto,
    );
    await this.usersRepository.saveBloggerBanUser(bannedUser);
    return { code: ResultCode.Success };
  }
}
