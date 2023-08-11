import { LoginDto } from '../dto/loginDto';
import bcrypt from 'bcrypt';
import { CommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../infrastructure/users/users.repository';

export class CheckCredentialsCommand {
  constructor(public loginDto: LoginDto) {}
}

@CommandHandler(CheckCredentialsCommand)
export class CheckCredentialsUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}
  async execute(command: CheckCredentialsCommand) {
    const user = await this.usersRepository.findUserByLoginOrEmail(
      command.loginDto.loginOrEmail,
    );
    console.log('user in CheckCredentialsCommand', user);
    if (!user || !user.isConfirmed || user.banInfo.isBanned) return null;

    const result = await bcrypt.compare(
      command.loginDto.password,
      user.passwordHash,
    );
    if (!result) return null;
    return user;
  }
}
