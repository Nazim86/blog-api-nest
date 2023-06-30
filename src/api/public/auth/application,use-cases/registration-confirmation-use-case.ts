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
    console.log(command.confirmationCodeDto.code);
    const user = await this.userRepository.findUserByConfirmationCode(
      command.confirmationCodeDto.code,
    );
    if (!user || user.isConfirmed || user.emailExpiration < new Date())
      return false;

    const isUserConfirmed = await this.userRepository.confirmRegistration(
      user.id,
    );
    //user.confirmRegistration();
    //await this.userRepository.save(user);
    return isUserConfirmed;
  }
}
