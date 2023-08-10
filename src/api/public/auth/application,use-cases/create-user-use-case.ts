import { CreateUserDto } from '../../../superadmin/users/dto/createUser.Dto';
import bcrypt from 'bcrypt';
import process from 'process';
import { CommandHandler } from '@nestjs/cqrs';
import { MailService } from '../../../../mail/mail.service';
import { UsersRepository } from '../../../infrastructure/users/users.repository';
import { Users } from '../../../entities/users/user.entity';
import { EmailConfirmation } from '../../../entities/users/email-confirmation';
import { v4 as uuid } from 'uuid';
import { add } from 'date-fns';

export class CreateUserCommand {
  constructor(public createUserDto: CreateUserDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase {
  constructor(
    private readonly mailService: MailService,
    private readonly usersRepository: UsersRepository,
  ) {}
  async execute(command: CreateUserCommand) {
    const passwordHash = await bcrypt.hash(
      command.createUserDto.password,
      Number(process.env.SALT_ROUND),
    );

    // const userId = await this.userRepository.createUser(
    //   command.createUserDto,
    //   passwordHash,
    //   false,
    // );

    const newUser = new Users();

    newUser.login = command.createUserDto.login;
    newUser.passwordHash = passwordHash;
    newUser.email = command.createUserDto.email;
    newUser.createdAt = new Date().toISOString();
    newUser.isConfirmed = true;

    const user = await this.usersRepository.createUser(newUser);
    console.log(user);

    const confirmationCode = uuid();

    const emailConfirmation = new EmailConfirmation();
    emailConfirmation.user = user;
    emailConfirmation.confirmationCode = confirmationCode;
    emailConfirmation.emailExpiration = add(new Date(), {
      hours: 1,
      minutes: 3,
    });

    await this.usersRepository.createEmailConfirmation(emailConfirmation);

    // const user = await this.usersRepository.findUserById(userId);

    try {
      await this.mailService.sendUserConfirmationEmail(
        emailConfirmation.confirmationCode,
        user.email,
        user.login,
      );
    } catch (e) {
      return null;
    }
    return;
  }
}
