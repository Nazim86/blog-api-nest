import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreateUserDto } from './createUser.Dto';
import { v4 as uuid } from 'uuid';
import { add } from 'date-fns';
import { Document } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

export type UserModelStaticType = {
  createUser: (
    createUserDto: CreateUserDto,
    passwordHash: string,
    UserModel: UserModuleTYpe,
  ) => UserDocument;
};

export type UserModuleTYpe = Model<User> & UserModelStaticType;

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({
    required: true,
    type: {
      login: { type: String, required: true },
      passwordHash: { type: String, required: true },
      email: { type: String, required: true },
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

  static createUser(
    createUserDto: CreateUserDto,
    passwordHash: string,
    UserModel: UserModuleTYpe,
  ) {
    // const passwordSalt = await bcrypt.genSalt(10);
    // const passwordHash = await bcrypt.hash(
    //   createUserDto.password,
    //   passwordSalt,
    // );

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
        isConfirmed: true,
      },
    };
    return new UserModel(newUser);
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

const userStaticMethods = { createUser: User.createUser };

UserSchema.statics = userStaticMethods;
