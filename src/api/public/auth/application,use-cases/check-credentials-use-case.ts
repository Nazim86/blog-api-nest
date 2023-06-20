import { LoginDto } from '../dto/loginDto';
import { UserDocument } from '../../../entities/user.entity';
import bcrypt from 'bcrypt';
import { CommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../infrastructure/users/users.repository';

export class CheckCredentialsCommand {
  constructor(public loginDto: LoginDto) {}
}

@CommandHandler(CheckCredentialsCommand)
export class CheckCredentialsUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}
  async execute(
    command: CheckCredentialsCommand,
  ): Promise<UserDocument | null> {
    const user: UserDocument | null =
      await this.usersRepository.findUserByLoginOrEmail(
        command.loginDto.loginOrEmail,
      );

    if (!user || !user.emailConfirmation.isConfirmed || user.banInfo.isBanned)
      return null;

    const result = await bcrypt.compare(
      command.loginDto.password,
      user.accountData.passwordHash,
    );
    if (!result) return null;
    return user;
  }
}
