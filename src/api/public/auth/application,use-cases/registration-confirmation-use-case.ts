import { CommandHandler } from '@nestjs/cqrs';
import { ConfirmationCodeDto } from '../dto/confirmationCodeDto';
import { UsersRepository } from '../../../infrastructure/users/users.repository';

export class RegistrationConfirmationCommand {
  constructor(public confirmationCodeDto: ConfirmationCodeDto) {}
}

@CommandHandler(RegistrationConfirmationCommand)
export class RegistrationConfirmationUseCase {
  constructor(private readonly userRepository: UsersRepository) {}

  async execute(command: RegistrationConfirmationCommand): Promise<boolean> {
    const user = await this.userRepository.findUserByConfirmationCode(
      command.confirmationCodeDto.code,
    );

    if (
      !user ||
      user.isConfirmed ||
      user.emailConfirmation.emailExpiration < new Date()
    )
      return false;

    user.isConfirmed = true;

    await this.userRepository.saveUser(user);
    return true;
  }
}
