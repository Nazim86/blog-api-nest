import { CommandHandler } from '@nestjs/cqrs';
import { BanUserDto } from './banUserDto';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { ResultCode } from '../../../exception-handler/result-code-enum';

export class BanUserCommand {
  constructor(public userId: string, public banUserDto: BanUserDto) {}
}
@CommandHandler(BanUserCommand)
export class BanUserUserCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: BanUserCommand) {
    const user = await this.usersRepository.findUserById(command.userId);

    console.log(user);

    if (!user) {
      const errorMessage = {
        message: [{ message: 'wrong userId', field: 'userId' }],
      };
      return {
        code: ResultCode.BadRequest,
        data: errorMessage,
      };
    }

    user.banUser(command.banUserDto);

    return this.usersRepository.save(user);
  }
}
