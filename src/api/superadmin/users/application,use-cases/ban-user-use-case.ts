import { CommandHandler } from '@nestjs/cqrs';
import { BanUserDto } from '../banUserDto';
import { UsersRepository } from '../infrastructure/users.repository';
import { ResultCode } from '../../../../exception-handler/result-code-enum';
import { UserDocument } from '../domain/user.entity';

export class BanUserCommand {
  constructor(public userId: string, public banUserDto: BanUserDto) {}
}
@CommandHandler(BanUserCommand)
export class BanUserUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: BanUserCommand) {
    const user: UserDocument | null = await this.usersRepository.findUserById(
      command.userId,
    );

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

    await this.usersRepository.save(user);
    return { code: ResultCode.Success };
  }
}