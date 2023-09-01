import { CommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../infrastructure/users/users.repository';
import { CreateUserDto } from '../dto/createUser.Dto';

import { CreateUserTransaction } from '../../../../common/createUserTransaction';
import bcrypt from 'bcrypt';
import { UsersBanBySa } from '../../../entities/users/users-ban-by-sa.entity';
import { Users } from '../../../entities/users/user.entity';

export class CreateUsersCommand {
  constructor(public createUserDto: CreateUserDto) {}
}
// @CommandHandler(CreateUsersCommand)
// export class CreateUsersUseCase {
//   constructor(private readonly usersRepository: UsersRepository) {}
//
//   async execute(command: CreateUsersCommand) {
//     const passwordHash = await bcrypt.hash(
//       command.createUserDto.password,
//       Number(process.env.SALT_ROUND),
//     );
//
//     const newUser = new Users();
//     newUser.login = command.createUserDto.login;
//     newUser.passwordHash = passwordHash;
//     newUser.email = command.createUserDto.email;
//     newUser.createdAt = new Date().toISOString();
//     newUser.isConfirmed = true;
//
//     const user = await this.usersRepository.saveUser(newUser);
//
//     const usersBanBySA = new UsersBanBySa();
//
//     usersBanBySA.user = user;
//     usersBanBySA.isBanned = false;
//
//     const result = await this.usersRepository.saveUsersBanBySA(usersBanBySA);
//     //console.log(result);
//     return user.id;
//   }
// }

@CommandHandler(CreateUsersCommand)
export class CreateUsersUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly createUserTransaction: CreateUserTransaction,
  ) {}

  // this is a function that allows us to use other "transaction" classes
  // inside of any other "main" transaction, i.e. without creating a new DB transaction

  async execute(command: CreateUsersCommand) {
    const userWithBanInfo = await this.createUserTransaction.run(
      command.createUserDto,
    );

    return userWithBanInfo.user.id;
  }
}
