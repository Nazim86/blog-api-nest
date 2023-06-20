import { CurrentUserType } from '../../../infrastructure/users/types/current-user-type';
import { UserDocument } from '../../../entities/user.entity';
import { CommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../infrastructure/users/users.repository';

export class CurrentUserCommand {
  constructor(public userId: string) {}
}

@CommandHandler(CurrentUserCommand)
export class CurrentUserUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}
  async execute(command: CurrentUserCommand): Promise<CurrentUserType> {
    const user: UserDocument = await this.usersRepository.findUserById(
      command.userId,
    );
    return {
      email: user.accountData.email,
      login: user.accountData.login,
      userId: command.userId,
    };
  }
}
