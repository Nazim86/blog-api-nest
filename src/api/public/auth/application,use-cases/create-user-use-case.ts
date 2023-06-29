import { CreateUserDto } from '../../../superadmin/users/dto/createUser.Dto';
import bcrypt from 'bcrypt';
import process from 'process';
import { CommandHandler } from '@nestjs/cqrs';
import { MailService } from '../../../../mail/mail.service';
import { UsersRepository } from '../../../infrastructure/users/users.repository';

export class CreateUserCommand {
  constructor(public createUserDto: CreateUserDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase {
  constructor(
    private readonly mailService: MailService,
    private readonly userRepository: UsersRepository,
  ) {}
  async execute(command: CreateUserCommand) {
    const passwordHash = await bcrypt.hash(
      command.createUserDto.password,
      Number(process.env.SALT_ROUND),
    );

    const userId = await this.userRepository.createUser(
      command.createUserDto,
      passwordHash,
      false,
    );

    //const result: UserDocument = await this.userRepository.save(newUser);
    const user = await this.userRepository.findUserById(userId);
    try {
      await this.mailService.sendUserConfirmationEmail(
        user.confirmationCode,
        user.email,
        user.login,
      );
    } catch (e) {
      return null;
    }
    return userId;
  }
}
