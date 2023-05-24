import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../users/infrastructure/users.repository';
import { JwtService } from '../jwt/jwt.service';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument, UserModelTYpe } from '../users/domain/user.entity';
import { CreateUserDto } from '../users/createUser.Dto';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import * as process from 'process';
import { NewPasswordDto } from './dto/newPasswordDto';
import { LoginDto } from './dto/loginDto';
import { EmailDto } from './dto/emailDto';
import { CurrentUserType } from '../users/infrastructure/types/current-user-type';
import { DeviceRepository } from '../securityDevices/device.repository';
import { MailService } from '../mail/mail.service';
import { ConfirmationCodeDto } from './dto/confirmationCodeDto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private UserModel: UserModelTYpe,
    protected userRepository: UsersRepository,
    protected jwtService: JwtService,
    protected deviceRepository: DeviceRepository,
    protected mailService: MailService,
  ) {}

  async createNewUser(
    creatUserDto: CreateUserDto,
  ): Promise<UserDocument | null> {
    const passwordHash = await bcrypt.hash(
      creatUserDto.password,
      Number(process.env.SALT_ROUND),
    );

    const newUser: UserDocument = this.UserModel.createUser(
      creatUserDto,
      passwordHash,
      this.UserModel,
      false,
    );

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

  async registrationConfirmation(
    confirmationCodeDto: ConfirmationCodeDto,
  ): Promise<boolean> {
    const user: UserDocument =
      await this.userRepository.findUserByConfirmationCode(
        confirmationCodeDto.code,
      );
    if (!user || !user.registrationCanBeConfirmed()) return false;

    user.confirmRegistration();
    await this.userRepository.save(user);
    return true;
  }

  async resendEmailWithNewConfirmationCode(
    emailDto: EmailDto,
  ): Promise<boolean> {
    const user: UserDocument | null = await this.userRepository.findUserByEmail(
      emailDto.email,
    );

    if (!user || !user.resendEmailCanBeConfirmed()) return false;

    try {
      const newCode = uuid();

      user.updateConfirmationCode(newCode);

      await this.userRepository.save(user);

      await this.mailService.sendUserConfirmationEmail(
        newCode,
        user.accountData.email,
        user.accountData.login,
      );
    } catch (e) {
      return false;
    }

    return true;
  }

  async sendingRecoveryCode(emailDto: EmailDto): Promise<boolean> {
    const user: UserDocument | null = await this.userRepository.findUserByEmail(
      emailDto.email,
    );

    if (user) {
      try {
        const recoveryCode = uuid();

        user.updateRecoveryCode(recoveryCode);

        await this.mailService.passwordRecoveryEmail(
          recoveryCode,
          user.accountData.email,
          user.accountData.login,
        );
      } catch (e) {
        return true;
      }
    }
    return true;
  }

  async setNewPasswordByRecoveryCode(
    newPasswordDto: NewPasswordDto,
  ): Promise<boolean> {
    const user: UserDocument | null =
      await this.userRepository.findUserByRecoveryCode(
        newPasswordDto.recoveryCode,
      );

    if (!user || !user.newPasswordCanBeConfirmed()) return false;

    const passwordHash = await bcrypt.hash(
      newPasswordDto.newPassword,
      process.env.SALT_ROUND,
    );

    user.updateUserAccountData(passwordHash);

    await this.userRepository.save(user);

    return true;
  }

  async deleteUser(id: string): Promise<boolean> {
    return await this.userRepository.deleteUser(id);
  }

  async checkCredentials(loginDto: LoginDto): Promise<UserDocument | null> {
    const user: UserDocument | null =
      await this.userRepository.findUserByLoginOrEmail(loginDto.loginOrEmail);

    if (!user || !user.emailConfirmation.isConfirmed) return null;

    const result = await bcrypt.compare(
      loginDto.password,
      user.accountData.passwordHash,
    );
    if (!result) return null;
    return user;
  }

  async findUserById(userId: string): Promise<UserDocument | null> {
    return await this.userRepository.findUserById(userId);
  }

  async getCurrentUser(userId: string): Promise<CurrentUserType> {
    const user: UserDocument = await this.userRepository.findUserById(userId);
    return {
      email: user.accountData.email,
      login: user.accountData.login,
      userId: userId,
    };
  }
}
