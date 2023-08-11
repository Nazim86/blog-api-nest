import { CommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../infrastructure/users/users.repository';
import { CreateUserDto } from '../dto/createUser.Dto';
import * as bcrypt from 'bcrypt';
import process from 'process';
import { Users } from '../../../entities/users/user.entity';
import { UsersBanBySa } from '../../../entities/users/users-ban-by-sa.entity';

export class CreateUsersCommand {
  constructor(public createUserDto: CreateUserDto) {}
}
@CommandHandler(CreateUsersCommand)
export class CreateUsersUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: CreateUsersCommand) {
    const passwordHash = await bcrypt.hash(
      command.createUserDto.password,
      Number(process.env.SALT_ROUND),
    );

    const newUser = new Users();
    newUser.login = command.createUserDto.login;
    newUser.passwordHash = passwordHash;
    newUser.email = command.createUserDto.email;
    newUser.createdAt = new Date().toISOString();
    newUser.isConfirmed = true;

    const user = await this.usersRepository.saveUser(newUser);

    const usersBanBySA = new UsersBanBySa();

    usersBanBySA.user = user;
    usersBanBySA.isBanned = false;

    await this.usersRepository.saveUsersBanBySA(usersBanBySA);

    return user.id;
  }
}
