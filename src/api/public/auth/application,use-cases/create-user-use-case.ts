import { CreateUserDto } from '../../../superadmin/users/dto/createUser.Dto';
import {
  User,
  UserDocument,
  UserModelTYpe,
} from '../../../entities/user.entity';
import bcrypt from 'bcrypt';
import process from 'process';
import { CommandHandler } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { MailService } from '../../../../mail/mail.service';
import { UsersRepository } from '../../../infrastructure/users/users.repository';

export class CreateUserCommand {
  constructor(public createUserDto: CreateUserDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase {
  constructor(
    @InjectModel(User.name) private UserModel: UserModelTYpe,
    private readonly mailService: MailService,
    private readonly userRepository: UsersRepository,
  ) {}
  async execute(command: CreateUserCommand): Promise<UserDocument | null> {
    const passwordHash = await bcrypt.hash(
      command.createUserDto.password,
      Number(process.env.SALT_ROUND),
    );

    const newUser: UserDocument = this.UserModel.createUser(
      command.createUserDto,
      passwordHash,
      this.UserModel,
      false,
    );

    console.log(newUser.emailConfirmation.confirmationCode);

    const result: UserDocument = await this.userRepository.save(newUser);

    try {
      await this.mailService.sendUserConfirmationEmail(
        newUser.emailConfirmation.confirmationCode,
        newUser.accountData.email,
        newUser.accountData.login,
      );
    } catch (e) {
      return null;
    }
    return result;
  }
}
