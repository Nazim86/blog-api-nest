import { EmailDto } from '../dto/emailDto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuid } from 'uuid';
import { UsersRepository } from '../../../infrastructure/users/users.repository';
import { MailService } from '../../../../mail/mail.service';
import { add } from 'date-fns';

export class ResendEmailCommand {
  constructor(public emailDto: EmailDto) {}
}

@CommandHandler(ResendEmailCommand)
export class ResendEmailUseCase implements ICommandHandler<ResendEmailCommand> {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly mailService: MailService,
  ) {}
  async execute(command: ResendEmailCommand): Promise<boolean> {
    const user = await this.usersRepository.findUserByEmail(
      command.emailDto.email,
    );

    if (
      !user ||
      user.isConfirmed ||
      user.emailConfirmation.emailExpiration < new Date()
    ) {
      return false;
    }

    const newCode = uuid();

    const newExpirationDate = add(new Date(), {
      hours: 1,
      minutes: 3,
    });

    user.emailConfirmation.confirmationCode = newCode;
    user.emailConfirmation.emailExpiration = newExpirationDate;

    await this.usersRepository.saveEmailConfirmation(user.emailConfirmation);

    this.mailService.sendUserConfirmationEmail(newCode, user.email, user.login);

    return true;
  }
}
