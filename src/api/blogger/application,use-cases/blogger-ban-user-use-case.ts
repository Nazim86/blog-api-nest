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

    bannedUser.updateBannedUser(
      user.accountData.login,
      command.userId,
      command.userBanDto,
    );
    await this.usersRepository.saveBloggerBanUser(bannedUser);
    return { code: ResultCode.Success };
  }
}
