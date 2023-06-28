import { CommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../infrastructure/users/users.repository';
import { CreateUserDto } from '../dto/createUser.Dto';
import * as bcrypt from 'bcrypt';
import process from 'process';
import { User, UserModelTYpe } from '../../../entities/user.entity';
import { InjectModel } from '@nestjs/mongoose';

export class CreateUsersCommand {
  constructor(public createUserDto: CreateUserDto) {}
}
@CommandHandler(CreateUsersCommand)
export class CreateUsersUseCase {
  constructor(
    @InjectModel(User.name) private UserModel: UserModelTYpe,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(command: CreateUsersCommand) {
    const passwordHash = await bcrypt.hash(
      command.createUserDto.password,
      Number(process.env.SALT_ROUND),
    );

    const userId = await this.usersRepository.createUser(
      command.createUserDto,
      passwordHash,
    );
    return userId;
  }
}
