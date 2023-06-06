import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';
import * as bcrypt from 'bcrypt';
import { User, UserDocument, UserModelTYpe } from '../domain/user.entity';

@Injectable()
export class UsersService {
  constructor(
    protected userRepository: UsersRepository,
    @InjectModel(User.name) private UserModel: UserModelTYpe,
  ) {}

  async deleteUser(id: string): Promise<boolean> {
    return await this.userRepository.deleteUser(id);
  }

  async checkCredentials(
    loginOrEmail: string,
    password: string,
  ): Promise<boolean> {
    const user: UserDocument | null =
      await this.userRepository.findUserByLoginOrEmail(loginOrEmail);

    if (!user) return false;

    if (!user.emailConfirmation.isConfirmed) return false;

    return bcrypt.compare(password, user.accountData.passwordHash);
  }

  async findUserByUsername(login: string) {
    const user: UserDocument = await this.userRepository.findUserByLoginOrEmail(
      login,
    );
    return user;
  }

  // async findUserById(userId: string): Promise<UserByIdType | null> {
  //   return await userRepositoryOld.findUserById(userId);
  // }
}
