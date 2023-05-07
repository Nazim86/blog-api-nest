import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { UserRepository } from './users.repository';
import { UserViewType } from './types/user-view-type';
import * as bcrypt from 'bcrypt';
import { User, UserDocument, UserModuleTYpe } from './user.entity';
import { CreateUserDto } from './createUser.Dto';

@Injectable()
export class UserService {
  constructor(
    protected userRepository: UserRepository,
    @InjectModel(User.name) private UserModel: UserModuleTYpe,
  ) {}

  async createNewUser(createUserDto: CreateUserDto): Promise<UserViewType> {
    const passwordHash = await bcrypt.hash(createUserDto.password, 10);
    //
    // const emailConfirmationType = new EmailConfirmation(
    //   uuid(),
    //   add(new Date(), {
    //     hours: 1,
    //     minutes: 3,
    //   }),
    //   true,
    // );
    //
    // const accountData = new AccountData(
    //   login,
    //   passwordHash,
    //   email,
    //   new Date().toISOString(),
    //   uuid(),
    //   add(new Date(), {
    //     hours: 1,
    //     minutes: 3,
    //   }),
    // );

    const newUser: UserDocument = this.UserModel.createUser(
      createUserDto,
      passwordHash,
      this.UserModel,
    );
    // return await userRepositoryOld.createNewUser(newUser) old version

    await this.userRepository.createNewUser(newUser);

    return {
      id: newUser._id.toString(),
      login: newUser.accountData.login,
      email: newUser.accountData.email,
      createdAt: newUser.accountData.createdAt,
    };
  }

  async _generateHash(password: string, passwordSalt: string): Promise<string> {
    return await bcrypt.hash(password, passwordSalt);
  }

  async deleteUser(id: string): Promise<boolean> {
    return await this.userRepository.deleteUser(id);
  }

  //   async checkCredentials(
  //     loginOrEmail: string,
  //     password: string,
  //   ): Promise<boolean> {
  //     const user: UserAccount | null =
  //       await this.userRepository.findUserByLoginOrEmail(loginOrEmail);
  //
  //     if (!user) return false;
  //
  //     if (!user.emailConfirmation.isConfirmed) return false;
  //
  //     return bcrypt.compare(password, user.accountData.passwordHash);
  //   }
  //
  //   async findUserById(userId: string): Promise<UserByIdType | null> {
  //     return await userRepositoryOld.findUserById(userId);
  //   }
  // }
}
