import { CommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../infrastructure/users/users.repository';
import { CreateUserDto } from '../dto/createUser.Dto';
import * as bcrypt from 'bcrypt';
import process from 'process';

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

    const userId = await this.usersRepository.createUser(
      command.createUserDto,
      passwordHash,
      true,
    );
    return userId;
  }
}
