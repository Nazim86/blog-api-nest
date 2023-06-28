import { Injectable } from '@nestjs/common';
import { User, UserDocument } from '../../entities/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  BloggerBanUser,
  BloggerBanUserDocument,
  BloggerBanUserModelType,
} from '../../entities/user-ban-by-blogger.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CreateUserDto } from '../../superadmin/users/dto/createUser.Dto';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name) private UserModel: Model<User>,
    @InjectModel(BloggerBanUser.name)
    private UserBanModeL: BloggerBanUserModelType,
    @InjectDataSource() protected dataSource: DataSource,
  ) {}

  async createUser(createUserDto: CreateUserDto, passwordHash: string) {
    const newUser = await this.dataSource.query(
      `INSERT INTO public."users"(
      "login", "passwordHash", "email", "createdAt","isConfirmed","isBanned")
    VALUES ($1, $2, $3, $4, $5, $6) returning id`,
      [
        createUserDto.login,
        passwordHash,
        createUserDto.email,
        new Date().toISOString(),
        true,
        false,
      ],
    );

    await this.dataSource.query(
      `INSERT INTO public.users_ban_by_sa("userId") VALUES ($1);`,
      [newUser[0].id],
    );
    return newUser[0].id;
  }

  async findUserByConfirmationCode(code: string) {
    return this.UserModel.findOne({
      'emailConfirmation.confirmationCode': code,
    });
  }

  async findUserByRecoveryCode(
    recoveryCode: string,
  ): Promise<UserDocument | null> {
    return this.UserModel.findOne({ 'accountData.recoveryCode': recoveryCode });
  }

  async findUserByEmail(email: string) {
    return this.UserModel.findOne({ 'accountData.email': email });
  }

  async save(user: UserDocument) {
    return user.save();
  }

  async saveBloggerBanUser(bannedUser: BloggerBanUserDocument) {
    return await bannedUser.save();
  }

  async findBloggerBannedUser(userId: string, blogId: string) {
    return this.UserBanModeL.findOne({
      userId,
      'banInfo.blogId': blogId,
      'banInfo.isBanned': true,
    });
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      // const result = await this.UserModel.deleteOne({ _id: new ObjectId(id) });
      const result = await this.dataSource.query(
        `DELETE FROM public."Users" WHERE "Id = $1";`,
        [id],
      );
      return result.deletedCount === 1;
    } catch (e) {
      return false;
    }
  }

  async findUserByLoginOrEmail(loginOrEmail: string) {
    const user = await this.dataSource.query(
      `SELECT u.*
FROM public.users u
where u."login"= $1 OR u."email" = $1;`,
      [loginOrEmail],
    );
    return user;
  }

  async findUserById(userId: string) {
    try {
      const user = await this.dataSource.query(
        `SELECT u.* FROM public.users u
        WHERE u."id" = $1`,
        [userId],
      );
      if (!user) return null;
      return user;
    } catch (e) {
      return null;
    }
  }
}
