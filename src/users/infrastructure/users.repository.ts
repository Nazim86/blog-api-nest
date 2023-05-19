import { Injectable } from '@nestjs/common';
import { User, UserDocument } from '../domain/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import add from 'date-fns/add';
import { ObjectId } from 'mongodb';

@Injectable()
export class UsersRepository {
  constructor(@InjectModel(User.name) private UserModel: Model<User>) {}

  async findUserByConfirmationCode(code: string): Promise<UserDocument | null> {
    const user: UserDocument | null = await this.UserModel.findOne({
      'emailConfirmation.confirmationCode': code,
    });
    return user;
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

  async updateConfirmation(userId: ObjectId): Promise<boolean> {
    const result = await this.UserModel.updateOne(
      { _id: userId },
      { $set: { 'emailConfirmation.isConfirmed': true } },
    );
    return result.modifiedCount === 1;
  }

  async setNewRecoveryCode(
    userId: ObjectId,
    recoveryCode: string,
  ): Promise<boolean> {
    const result = await this.UserModel.updateOne(
      { _id: userId },
      {
        $set: {
          'accountData.recoveryCode': recoveryCode,
          'accountData.recoveryCodeExpiration': add(new Date(), {
            hours: 1,
            minutes: 3,
          }),
        },
      },
    );

    return result.matchedCount === 1;
  }

  // async setNewConfirmationCode(
  //   userId: ObjectId,
  //   confirmationCode: string,
  // ): Promise<boolean> {
  //   const result = await this.UserModel.updateMany(
  //     { _id: userId },
  //     { $set: { 'emailConfirmation.confirmationCode': confirmationCode } },
  //   );
  //
  //   return result.matchedCount === 1;
  // }

  async updateUserAccountData(
    userId: ObjectId,
    passwordHash: string,
  ): Promise<boolean> {
    const result = await this.UserModel.updateOne(
      { _id: userId },
      {
        $set: { 'accountData.passwordHash': passwordHash },
      },
    );
    return result.modifiedCount === 1;
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
    const user: UserDocument = await this.UserModel.findOne({
      _id: new ObjectId(userId),
    });
    if (!user) return null;
    return user;
  }
}
