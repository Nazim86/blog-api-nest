import { NewPasswordDto } from '../dto/newPasswordDto';
import { CommandHandler } from '@nestjs/cqrs';
import bcrypt from 'bcrypt';
import process from 'process';
import { UsersRepository } from '../../../infrastructure/users/users.repository';
import { ResultCode } from '../../../../exception-handler/result-code-enum';
import { Result } from '../../../../exception-handler/result-type';

export class SetNewPasswordCommand {
  constructor(public newPasswordDto: NewPasswordDto) {}
}

@CommandHandler(SetNewPasswordCommand)
export class SetNewPasswordUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}
  async execute(command: SetNewPasswordCommand): Promise<Result<any>> {
    const user = await this.usersRepository.findUserByRecoveryCode(
      command.newPasswordDto.recoveryCode,
    );
    const errorMessage = {
      message: [{ message: 'wrong recovery code', field: 'recoveryCode' }],
    };

    if (!user || user.passwordRecovery.recoveryCodeExpiration < new Date())
      return { code: ResultCode.BadRequest, data: errorMessage };

    const passwordHash = await bcrypt.hash(
      command.newPasswordDto.newPassword,
      Number(process.env.SALT_ROUND),
    );

    user.passwordHash = passwordHash;
    user.passwordRecovery.recoveryCode = null;
    user.passwordRecovery.user = null;
    user.passwordRecovery.recoveryCodeExpiration = null;

    const result = await this.usersRepository.saveUser(user);

    return { code: result ? ResultCode.Success : ResultCode.BadRequest };
  }
}
