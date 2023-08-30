import { EmailDto } from '../dto/emailDto';
import { CommandHandler } from '@nestjs/cqrs';
import { v4 as uuid } from 'uuid';
import { UsersRepository } from '../../../infrastructure/users/users.repository';
import { MailService } from '../../../../mail/mail.service';
import { add } from 'date-fns';

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
    console.log('user in ResendEmailUseCase', user);

    // try {
    if (
      !user ||
      user.isConfirmed ||
      user.emailConfirmation.emailExpiration < new Date()
    )
      return false;

    console.log('ends here');
    const newCode = uuid();

    const newExpirationDate = add(new Date(), {
      hours: 1,
      minutes: 3,
    });

    user.emailConfirmation.confirmationCode = newCode;
    user.emailConfirmation.emailExpiration = newExpirationDate;

    await this.usersRepository.saveEmailConfirmation(user.emailConfirmation);

    // const isUpdated = await this.usersRepository.updateConfirmationCode(
    //   user.id,
    //   newCode,
    // );

    // if (!isUpdated) return false;

    await this.mailService.sendUserConfirmationEmail(
      newCode,
      user.email,
      user.login,
    );
    // } catch (e) {
    //   console.log('error in ResendEmailUseCase', e);
    //   return false;
    // }

    return true;
  }
}
