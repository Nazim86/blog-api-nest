import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreateUserDto } from '../superadmin/users/dto/createUser.Dto';
import { v4 as uuid } from 'uuid';
import { add } from 'date-fns';
import { BanUserDto } from '../superadmin/users/dto/banUserDto';
import { Entity } from 'typeorm';

export type UserDocument = HydratedDocument<User>;
export type UserModelStaticType = {
  createUser: (
    createUserDto: CreateUserDto,
    passwordHash: string,
    UserModel: UserModelTYpe,
    isConfirmed?: boolean,
  ) => UserDocument;
};

export type UserModelTYpe = Model<User> & UserModelStaticType;

//@Schema({ timestamps: true })
@Entity()
export class User {
  constructor() {
    this.emailConfirmation = {
      confirmationCode: '',
      emailExpiration: new Date(),
      isConfirmed: false,
    };
  }
  @Prop({
    _id: false,
    required: true,
    type: {
      login: { type: String, required: true, unique: true },
      passwordHash: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      createdAt: { type: Date, required: true },
      recoveryCode: { type: String, required: true },
      recoveryCodeExpiration: { type: Date, required: true },
    },
  })
  accountData: {
    login: string;
    passwordHash: string;
    email: string;
    createdAt: Date;
    recoveryCode: string;
    recoveryCodeExpiration: Date;
  };

  @Prop({
    _id: false,
    required: true,
    type: {
      confirmationCode: { type: String, required: true },
      emailExpiration: { type: Date, required: true },
      isConfirmed: { type: Boolean, required: true },
    },
  })
  emailConfirmation: {
    confirmationCode: string;
    emailExpiration: Date;
    isConfirmed: boolean;
  };

  @Prop({
    _id: false,
    type: {
      isBanned: { type: Boolean },
      banDate: { type: String },
      banReason: { type: String },
    },
  })
  banInfo: {
    isBanned: boolean;
    banDate: string;
    banReason: string;
  };

  static createUser(
    createUserDto: CreateUserDto,
    passwordHash: string,
    UserModel: UserModelTYpe,
    isConfirmed?: boolean,
  ) {
    const newUser = {
      accountData: {
        login: createUserDto.login,
        passwordHash: passwordHash,
        email: createUserDto.email,
        createdAt: new Date().toISOString(),
        recoveryCode: uuid(),
        recoveryCodeExpiration: add(new Date(), {
          hours: 1,
          minutes: 3,
        }),
      },
      emailConfirmation: {
        confirmationCode: uuid(),
        emailExpiration: add(new Date(), {
          hours: 1,
          minutes: 3,
        }),
        isConfirmed: isConfirmed ?? true,
      },
      banInfo: {
        isBanned: false,
        banDate: null,
        banReason: null,
      },
    };
    return new UserModel(newUser);
  }

  updateConfirmationCode(newCode: string) {
    (this.emailConfirmation.confirmationCode = newCode),
      (this.emailConfirmation.emailExpiration = add(new Date(), {
        hours: 1,
        minutes: 3,
      }));
  }

  updateRecoveryCode(newCode: string) {
    (this.accountData.recoveryCode = newCode),
      (this.accountData.recoveryCodeExpiration = add(new Date(), {
        hours: 1,
        minutes: 3,
      }));
  }
  resendEmailCanBeConfirmed() {
    if (
      this.emailConfirmation.isConfirmed ||
      this.emailConfirmation.emailExpiration < new Date()
    ) {
      return false;
    }
    return true;
  }

  registrationCanBeConfirmed() {
    if (
      this.emailConfirmation.isConfirmed ||
      this.emailConfirmation.emailExpiration < new Date()
    ) {
      return false;
    }
    return true;
  }

  confirmRegistration() {
    this.emailConfirmation.isConfirmed = true;
  }

  newPasswordCanBeConfirmed() {
    return this.accountData.recoveryCodeExpiration >= new Date();
  }

  updateUserAccountData(passwordHash: string) {
    this.accountData.passwordHash = passwordHash;
    this.accountData.recoveryCode = null;
  }
  banUser(banUserDto: BanUserDto) {
    (this.banInfo.isBanned = banUserDto.isBanned),
      (this.banInfo.banDate = new Date().toISOString()),
      (this.banInfo.banReason = banUserDto.banReason);
  }

  unBanUser() {
    (this.banInfo.isBanned = false),
      (this.banInfo.banDate = null),
      (this.banInfo.banReason = null);
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

const userStaticMethods = { createUser: User.createUser };

UserSchema.statics = userStaticMethods;

UserSchema.methods = {
  updateConfirmationCode: User.prototype.updateConfirmationCode,
  updateRecoveryCode: User.prototype.updateRecoveryCode,
  resendEmailCanBeConfirmed: User.prototype.resendEmailCanBeConfirmed,
  registrationCanBeConfirmed: User.prototype.registrationCanBeConfirmed,
  confirmRegistration: User.prototype.confirmRegistration,
  newPasswordCanBeConfirmed: User.prototype.newPasswordCanBeConfirmed,
  updateUserAccountData: User.prototype.updateUserAccountData,
  unBanUser: User.prototype.unBanUser,
  banUser: User.prototype.banUser,
};
