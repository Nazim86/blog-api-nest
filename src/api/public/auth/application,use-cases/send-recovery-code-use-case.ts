import { CommandHandler } from '@nestjs/cqrs';
import { EmailDto } from '../dto/emailDto';
import { v4 as uuid } from 'uuid';
import { UsersRepository } from '../../../infrastructure/users/users.repository';
import { MailService } from '../../../../mail/mail.service';
import { ResultCode } from '../../../../exception-handler/result-code-enum';
import { Result } from '../../../../exception-handler/result-type';

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

      console.log(recoveryCode);

      await this.usersRepository.createRecoveryCode(user.id, recoveryCode);

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
