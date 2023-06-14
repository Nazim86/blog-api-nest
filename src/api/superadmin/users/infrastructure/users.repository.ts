import { Injectable } from '@nestjs/common';
import { User, UserDocument } from '../../../../domains/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import {
  UserBanByBlogger,
  UserBanByBloggerDocument,
  UserBanByBloggerModelType,
} from '../../../../domains/user-ban-by-blogger.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name) private UserModel: Model<User>,
    @InjectModel(UserBanByBlogger.name)
    private UserBanModeL: UserBanByBloggerModelType,
  ) {}

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
    return await user.save();
  }

  async saveBloggerBanUser(bannedUser: UserBanByBloggerDocument) {
    return await bannedUser.save();
  }

  async findBloggerBannedUser(userId: string, blogId: string) {
    return this.UserBanModeL.findOne({ userId, blogId });
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      const result = await this.UserModel.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount === 1;
    } catch (e) {
      return false;
    }
  }

  async findUserByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<UserDocument | null> {
    return this.UserModel.findOne({
      $or: [
        { 'accountData.login': loginOrEmail },
        { 'accountData.email': loginOrEmail },
      ],
    });
  }

  async findUserById(userId: string): Promise<UserDocument | null> {
    try {
      const user: UserDocument = await this.UserModel.findOne({
        _id: new ObjectId(userId),
      });
      if (!user) return null;
      return user;
    } catch (e) {
      return null;
    }
  }
}
