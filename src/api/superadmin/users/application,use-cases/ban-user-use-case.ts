import { CommandHandler } from '@nestjs/cqrs';
import { BanUserDto } from '../dto/banUserDto';
import { UsersRepository } from '../../../infrastructure/users/users.repository';
import { ResultCode } from '../../../../exception-handler/result-code-enum';
import { DeviceRepository } from '../../../infrastructure/devices/device.repository';
import { LikesRepository } from '../../../infrastructure/likes/likes.repository';
import { CommentsRepository } from '../../../infrastructure/comments/comments.repository';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export class BanUserCommand {
  constructor(public userId: string, public banUserDto: BanUserDto) {}
}
@CommandHandler(BanUserCommand)
export class BanUserUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly deviceRepository: DeviceRepository,
    private readonly likesRepository: LikesRepository,
    private readonly commentsRepository: CommentsRepository,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async execute(command: BanUserCommand) {
    const user = await this.usersRepository.findUserById(command.userId);

    if (!user) {
      const errorMessage = {
        message: [{ message: 'wrong userId', field: 'userId' }],
      };
      return {
        code: ResultCode.BadRequest,
        data: errorMessage,
      };
    }

    if (
      user.isBanned !== command.banUserDto.isBanned &&
      command.banUserDto.isBanned
    ) {
      await this.usersRepository.banUser(command.userId, command.banUserDto);

      //user.banUser(command.banUserDto);

      await this.likesRepository.setBanStatusForCommentLike(
        command.userId,
        true,
      );

      await this.likesRepository.setBanStatusForPostLike(command.userId, true);

      await this.commentsRepository.setBanStatusForComment(
        command.userId,
        true,
      );

      await this.deviceRepository.deleteDeviceByUserId(command.userId);
    }

    if (
      user.isBanned !== command.banUserDto.isBanned &&
      !command.banUserDto.isBanned
    ) {
      await this.usersRepository.unBanUser(command.userId);
      // user.unBanUser();

      await this.likesRepository.setBanStatusForCommentLike(
        command.userId,
        false,
      );

      await this.likesRepository.setBanStatusForPostLike(command.userId, false);
      await this.commentsRepository.setBanStatusForComment(
        command.userId,
        false,
      );
    }

    // await this.usersRepository.save(user);

    return { code: ResultCode.Success };
  }
}
