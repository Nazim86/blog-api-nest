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
import { UsersBanBySa } from '../../../entities/users/users-ban-by-sa.entity';

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

    const newUser = new Users();

    newUser.login = command.createUserDto.login;
    newUser.passwordHash = passwordHash;
    newUser.email = command.createUserDto.email;
    newUser.createdAt = new Date().toISOString();
    newUser.isConfirmed = false;

    const user = await this.usersRepository.saveUser(newUser);

    const usersBanBySA = new UsersBanBySa();

    usersBanBySA.user = user;
    usersBanBySA.isBanned = false;

    await this.usersRepository.saveUsersBanBySA(usersBanBySA);

    const confirmationCode = uuid();

    const expirationDate = add(new Date(), {
      hours: 1,
      minutes: 3,
    });

    const emailConfirmation = new EmailConfirmation();
    emailConfirmation.user = user;
    emailConfirmation.confirmationCode = confirmationCode;
    emailConfirmation.emailExpiration = expirationDate;

    await this.usersRepository.saveEmailConfirmation(emailConfirmation);

    // const user = await this.usersRepository.findUserById(userId);

    try {
      this.mailService.sendUserConfirmationEmail(
        emailConfirmation.confirmationCode,
        user.email,
        user.login,
      );
    } catch (e) {
      return null;
    }
    return user.id;
  }
}
