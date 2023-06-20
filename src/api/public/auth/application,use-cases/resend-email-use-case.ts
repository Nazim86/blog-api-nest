import { EmailDto } from '../dto/emailDto';
import { CommandHandler } from '@nestjs/cqrs';
import { UserDocument } from '../../../entities/user.entity';
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
    const user: UserDocument | null =
      await this.usersRepository.findUserByEmail(command.emailDto.email);

    if (!user || !user.resendEmailCanBeConfirmed()) return false;

    try {
      const newCode = uuid();

      user.updateConfirmationCode(newCode);

      await this.usersRepository.save(user);

      await this.mailService.sendUserConfirmationEmail(
        newCode,
        user.accountData.email,
        user.accountData.login,
      );
    } catch (e) {
      return false;
    }

    return true;
  }
}
