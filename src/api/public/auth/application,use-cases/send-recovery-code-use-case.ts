import { CommandHandler } from '@nestjs/cqrs';
import { EmailDto } from '../dto/emailDto';
import { v4 as uuid } from 'uuid';
import { UsersRepository } from '../../../infrastructure/users/users.repository';
import { MailService } from '../../../../mail/mail.service';

export class SendRecoveryCodeCommand {
  constructor(public emailDto: EmailDto) {}
}

@CommandHandler(SendRecoveryCodeCommand)
export class SendRecoveryCodeUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly mailService: MailService,
  ) {}
  async execute(command: SendRecoveryCodeCommand): Promise<boolean> {
    const user = await this.usersRepository.findUserByEmail(
      command.emailDto.email,
    );

    if (user) {
      try {
        const recoveryCode = uuid();

        await this.usersRepository.createRecoveryCode(user.id, recoveryCode);

        await this.mailService.passwordRecoveryEmail(
          recoveryCode,
          user.email,
          user.login,
        );
      } catch (e) {
        return true;
      }
    }
    return true;
  }
}
