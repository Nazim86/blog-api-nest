import { CommandHandler } from '@nestjs/cqrs';
import { BanUserDto } from '../dto/banUserDto';
import { UsersRepository } from '../infrastructure/users.repository';
import { ResultCode } from '../../../../exception-handler/result-code-enum';
import { UserDocument } from '../../../../domains/user.entity';
import { DeviceRepository } from '../../../public/securityDevices/infrastructure/device.repository';
import { LikesRepository } from '../../../public/like/likes.repository';

export class BanUserCommand {
  constructor(public userId: string, public banUserDto: BanUserDto) {}
}
@CommandHandler(BanUserCommand)
export class BanUserUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly deviceRepository: DeviceRepository,
    private readonly likesRepository: LikesRepository,
  ) {}

  async execute(command: BanUserCommand) {
    const user: UserDocument | null = await this.usersRepository.findUserById(
      command.userId,
    );

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
      user.banInfo.isBanned !== command.banUserDto.isBanned &&
      command.banUserDto.isBanned
    ) {
      user.banUser(command.banUserDto);

      await this.likesRepository.setBanStatusForCommentLike(
        command.userId,
        true,
      );

      await this.likesRepository.setBanStatusForPostLike(command.userId, true);

      await this.deviceRepository.deleteDeviceByUserId(user.id);
    }

    if (
      user.banInfo.isBanned !== command.banUserDto.isBanned &&
      !command.banUserDto.isBanned
    ) {
      user.unBanUser();

      await this.likesRepository.setBanStatusForCommentLike(
        command.userId,
        false,
      );

      await this.likesRepository.setBanStatusForPostLike(command.userId, false);
    }

    await this.usersRepository.save(user);

    return { code: ResultCode.Success };
  }
}
