import { CurrentUserType } from '../../../infrastructure/users/types/current-user-type';
import { CommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../infrastructure/users/users.repository';

export class CurrentUserCommand {
  constructor(public userId: string) {}
}

@CommandHandler(CurrentUserCommand)
export class CurrentUserUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}
  async execute(command: CurrentUserCommand): Promise<CurrentUserType> {
    const user = await this.usersRepository.findUserById(command.userId);
    return {
      email: user.email,
      login: user.login,
      userId: command.userId,
    };
  }
}
