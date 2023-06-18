import { CommandHandler } from '@nestjs/cqrs';
import { ConfirmationCodeDto } from '../dto/confirmationCodeDto';
import { UserDocument } from '../../../entities/user.entity';
import { UsersRepository } from '../../../infrastructure/users/users.repository';

export class RegistrationConfirmationCommand {
  constructor(public confirmationCodeDto: ConfirmationCodeDto) {}
}

@CommandHandler(RegistrationConfirmationCommand)
export class RegistrationConfirmationUseCase {
  constructor(private readonly userRepository: UsersRepository) {}

  async execute(command: RegistrationConfirmationCommand): Promise<boolean> {
    const user: UserDocument =
      await this.userRepository.findUserByConfirmationCode(
        command.confirmationCodeDto.code,
      );
    if (!user || !user.registrationCanBeConfirmed()) return false;

    user.confirmRegistration();
    await this.userRepository.save(user);
    return true;
  }
}
