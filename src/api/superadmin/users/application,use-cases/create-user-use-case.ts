import { CommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../infrastructure/users.repository';
import { ResultCode } from '../../../../exception-handler/result-code-enum';
import { CreateUserDto } from '../createUser.Dto';
import * as bcrypt from 'bcrypt';
import process from 'process';
import { User, UserDocument, UserModelTYpe } from '../domain/user.entity';
import { exceptionHandler } from '../../../../exception-handler/exception-handler';
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

    const newUser: UserDocument = this.UserModel.createUser(
      command.createUserDto,
      passwordHash,
      this.UserModel,
    );

    try {
      await this.usersRepository.save(newUser);
    } catch (e) {
      exceptionHandler(ResultCode.BadRequest);
    }

    return newUser.id;
  }
}