import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';
import * as bcrypt from 'bcrypt';
import { User, UserDocument, UserModelTYpe } from '../domain/user.entity';
import { CreateUserDto } from '../createUser.Dto';
import * as process from 'process';

@Injectable()
export class UsersService {
  constructor(
    protected userRepository: UsersRepository,
    @InjectModel(User.name) private UserModel: UserModelTYpe,
  ) {}

  async createNewUser(createUserDto: CreateUserDto): Promise<string> {
    const passwordHash = await bcrypt.hash(
      createUserDto.password,
      Number(process.env.SALT_ROUND),
    );

    const newUser: UserDocument = this.UserModel.createUser(
      createUserDto,
      passwordHash,
      this.UserModel,
    );
    // return await userRepositoryOld.createNewUser(newUser) old version

    await this.userRepository.save(newUser);

    return newUser.id;
  }

  async _generateHash(password: string, passwordSalt: string): Promise<string> {
    return await bcrypt.hash(password, passwordSalt);
  }

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
