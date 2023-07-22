import { EmailDto } from '../dto/emailDto';
import { CommandHandler } from '@nestjs/cqrs';
import { v4 as uuid } from 'uuid';
import { UsersRepository } from '../../../infrastructure/users/users.repository';
import { MailService } from '../../../../mail/mail.service';

export class ResendEmailCommand {
  constructor(public emailDto: EmailDto) {}
}

@CommandHandler(ResendEmailCommand)
export class ResendEmailUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly mailService: MailService,
  ) {}
  async execute(command: ResendEmailCommand): Promise<boolean> {
    const user = await this.usersRepository.findUserByEmail(
      command.emailDto.email,
    );
    try {
      if (!user || user.isConfirmed || user.emailExpiration < new Date())
        return false;

      const newCode = uuid();

      const isUpdated = await this.usersRepository.updateConfirmationCode(
        user.id,
        newCode,
      );

      if (!isUpdated) return false;

      await this.mailService.sendUserConfirmationEmail(
        newCode,
        user.email,
        user.login,
      );
    } catch (e) {
      return false;
    }

    return true;
  }
}
