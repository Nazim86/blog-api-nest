import { NewPasswordDto } from '../dto/newPasswordDto';
import { CommandHandler } from '@nestjs/cqrs';
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
    const user = await this.usersRepository.findUserByRecoveryCode(
      command.newPasswordDto.recoveryCode,
    );
    console.log('before');
    if (!user || user.recoveryCodeExpiration < new Date()) return false;
    console.log('after');

    const passwordHash = await bcrypt.hash(
      command.newPasswordDto.newPassword,
      Number(process.env.SALT_ROUND),
    );

    const isUserUpdated = await this.usersRepository.setNewPassword(
      user.id,
      passwordHash,
    );

    return isUserUpdated;
  }
}
