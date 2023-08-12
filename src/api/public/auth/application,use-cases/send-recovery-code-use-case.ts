import { CommandHandler } from '@nestjs/cqrs';
import { EmailDto } from '../dto/emailDto';
import { v4 as uuid } from 'uuid';
import { UsersRepository } from '../../../infrastructure/users/users.repository';
import { MailService } from '../../../../mail/mail.service';
import { ResultCode } from '../../../../exception-handler/result-code-enum';
import { Result } from '../../../../exception-handler/result-type';
import { add } from 'date-fns';
import { PasswordRecovery } from '../../../entities/users/password-recovery';

export class SendRecoveryCodeCommand {
  constructor(public emailDto: EmailDto) {}
}

@CommandHandler(SendRecoveryCodeCommand)
export class SendRecoveryCodeUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly mailService: MailService,
  ) {}

  async execute(command: SendRecoveryCodeCommand): Promise<Result<any>> {
    const user = await this.usersRepository.findUserByEmail(
      command.emailDto.email,
    );

    const errorMessage = {
      message: [{ message: 'wrong email', field: 'email' }],
    };

    if (!user) {
      return { code: ResultCode.BadRequest, data: errorMessage };
    }

    try {
      const recoveryCode = uuid();
      const expirationDate = add(new Date(), {
        hours: 1,
        minutes: 3,
      });

      const passwordRecovery = new PasswordRecovery();

      passwordRecovery.recoveryCodeExpiration = expirationDate;
      passwordRecovery.recoveryCode = recoveryCode;
      passwordRecovery.user = user;
      await this.usersRepository.savePasswordRecovery(passwordRecovery);

      await this.mailService.passwordRecoveryEmail(
        recoveryCode,
        user.email,
        user.login,
      );
      return { code: ResultCode.Success };
    } catch (e) {
      return { code: ResultCode.Success };
    }
  }
}
