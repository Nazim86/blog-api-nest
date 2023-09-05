import { CommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../infrastructure/users/users.repository';
import { CreateUserDto } from '../dto/createUser.Dto';
import { CreateUserTransaction } from './createUserTransaction';
import { UserWithBanInfo } from '../../../infrastructure/users/types/userWithBanInfo-type';

export class CreateUsersCommand {
  constructor(public createUserDto: CreateUserDto) {}
}

@CommandHandler(CreateUsersCommand)
export class CreateUsersUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly createUserTransaction: CreateUserTransaction,
  ) {}

  // this is a function that allows us to use other "transaction" classes
  // inside of any other "main" transaction, i.e. without creating a new DB transaction

  async execute(command: CreateUsersCommand) {
    const userWithBanInfo: UserWithBanInfo =
      await this.createUserTransaction.run(command.createUserDto);

    return userWithBanInfo.user.id;
  }
}
