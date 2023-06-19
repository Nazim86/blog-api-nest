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
import { BanUserDto } from '../../superadmin/users/dto/banUserDto';

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

    // if (blog.blogOwnerInfo.userId !== user.id) {
    //   return { code: ResultCode.Forbidden };
    // }

    const updateBanInfo = command.userBanDto.isBanned
      ? {
          blogId: command.userBanDto.blogId,
          login: user.accountData.login,
          userId: command.userId,
          banInfo: {
            isBanned: true,
            banDate: new Date().toISOString(),
            banReason: command.userBanDto.banReason,
          },
        }
      : {
          blogId: command.userBanDto.blogId,
          login: user.accountData.login,
          userId: command.userId,
          banInfo: {
            isBanned: false,
            banDate: null,
            banReason: null,
          },
        };

    await this.UserBanModel.updateOne(
      { blogId: command.userBanDto.blogId, userId: command.userId },
      { $set: { ...updateBanInfo } },
      { upsert: true },
    );

    // const bannedUser: BloggerBanUserDocument =
    //   await this.usersRepository.findBloggerBannedUser(
    //     command.userId,
    //     command.userBanDto.blogId,
    //   );
    //
    // if (bannedUser && command.userBanDto.isBanned)
    //   return { code: ResultCode.Success };
    //
    // if (!bannedUser && command.userBanDto.isBanned) {
    //   const banUser = await this.UserBanModel.createBannedUser(
    //     user.accountData.login,
    //     command.userId,
    //     command.userBanDto,
    //     this.UserBanModel,
    //   );
    //   await this.usersRepository.saveBloggerBanUser(banUser);
    //   return { code: ResultCode.Success };
    // }
    //
    // if (bannedUser && !command.userBanDto.isBanned)
    //   bannedUser.updateBannedUser(
    //     user.accountData.login,
    //     command.userId,
    //     command.userBanDto,
    //   );
    // await this.usersRepository.saveBloggerBanUser(bannedUser);

    return { code: ResultCode.Success };
  }
}
