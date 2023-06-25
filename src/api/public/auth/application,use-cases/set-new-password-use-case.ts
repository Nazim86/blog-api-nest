import { NewPasswordDto } from '../dto/newPasswordDto';
import { CommandHandler } from '@nestjs/cqrs';
import { UserDocument } from '../../../entities/user.entity';
import bcrypt from 'bcrypt';
import process from 'process';
import { UsersRepository } from '../../../infrastructure/users/users.repository';

export class SetNewPasswordCommand {
  constructor(public newPasswordDto: NewPasswordDto) {}
}

@CommandHandler(SetNewPasswordCommand)
export class SetNewPasswordUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}
  async execute(command: SetNewPasswordCommand): Promise<boolean> {
    const user: UserDocument | null =
      await this.usersRepository.findUserByRecoveryCode(
        command.newPasswordDto.recoveryCode,
      );

    if (!user || !user.newPasswordCanBeConfirmed()) return false;

    const passwordHash = await bcrypt.hash(
      command.newPasswordDto.newPassword,
      process.env.SALT_ROUND,
    );

    user.updateUserAccountData(passwordHash);

    await this.usersRepository.save(user);

    return true;
  }
}
