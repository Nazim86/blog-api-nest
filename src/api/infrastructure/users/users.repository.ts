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
import { BanUserDto } from '../../superadmin/users/dto/banUserDto';
import { v4 as uuid } from 'uuid';
import { add } from 'date-fns';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectModel(User.name) private UserModel: Model<User>,
    @InjectModel(BloggerBanUser.name)
    private UserBanModeL: BloggerBanUserModelType,
    @InjectDataSource() protected dataSource: DataSource,
  ) {}

  async createUser(
    createUserDto: CreateUserDto,
    passwordHash: string,
    isConfirmed: boolean,
  ) {
    const newUser = await this.dataSource.query(
      `INSERT INTO public."users"(
      "login", "passwordHash", "email", "createdAt","isConfirmed","isBanned")
    VALUES ($1, $2, $3, $4, $5, $6) returning id`,
      [
        createUserDto.login,
        passwordHash,
        createUserDto.email,
        new Date().toISOString(),
        isConfirmed,
        false,
      ],
    );

    await this.dataSource.query(
      `INSERT INTO public.users_ban_by_sa("userId") VALUES ($1);`,
      [newUser[0].id],
    );

    await this.dataSource.query(
      `INSERT INTO public.email_confirmation(
        "userId", "confirmationCode", "emailExpiration")
        VALUES ($1, $2, $3);`,
      [
        newUser[0].id,
        uuid(),
        add(new Date(), {
          hours: 1,
          minutes: 3,
        }),
      ],
    );
    return newUser[0].id;
  }

  async updateConfirmationCode(userId: string, newCode: string) {
    const result = await this.dataSource.query(
      `UPDATE public.email_confirmation ec
        SET "confirmationCode"=$1, "emailExpiration"=$2
        WHERE ec."userId" = $3;`,
      [
        newCode,
        add(new Date(), {
          hours: 1,
          minutes: 3,
        }),
        userId,
      ],
    );
    return result[1] === 1;
  }

  async confirmRegistration(userId: string) {
    const result = await this.dataSource.query(
      `UPDATE public.users 
            SET "isConfirmed"=true
            WHERE "id" = $1;`,
      [userId],
    );
    return result[1] === 1;
  }

  async findUserByConfirmationCode(code: string) {
    const user = await this.dataSource.query(
      `SELECT  u.*,ec."confirmationCode", ec."emailExpiration"
            FROM public.email_confirmation ec
            left join public.users u 
            on ec."userId"= u."id"
            where ec."confirmationCode" = $1`,
      [code],
    );
    return user[0];
  }

  async findUserByRecoveryCode(
    recoveryCode: string,
  ): Promise<UserDocument | null> {
    return this.UserModel.findOne({ 'accountData.recoveryCode': recoveryCode });
  }

  async findUserByEmail(email: string) {
    const user = await this.dataSource.query(
      `SELECT u.*,ub."banDate",ub."banReason",ec."confirmationCode", ec."emailExpiration"
                FROM public.users u
                left join public.users_ban_by_sa ub on
                u."id" = ub."userId"
                left join public.email_confirmation ec on
                u."id" = ec."userId"
                where u."email" = $1`,
      [email],
    );

    return user[0];
    //this.UserModel.findOne({ 'accountData.email': email });
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

  async banUser(userId, banUserDto: BanUserDto) {
    await this.dataSource.query(
      `UPDATE public.users u SET "isBanned"=$1
     WHERE u."id" = $2;`,
      [banUserDto.isBanned, userId],
    );

    await this.dataSource.query(
      `UPDATE public.users_ban_by_sa ub
    SET "banReason"=$1, "banDate" = $2
    WHERE ub."userId" = $3;`,
      [banUserDto.banReason, new Date().toISOString(), userId],
    );

    return; //userResult[1] === 1 && userBanResult[1] === 1;
  }

  async unBanUser(userId) {
    await this.dataSource.query(
      `UPDATE public.users u SET "isBanned"=false
     WHERE u."id" = $1;`,
      [userId],
    );

    await this.dataSource.query(
      `UPDATE public.users_ban_by_sa ub
    SET "banReason"=null, "banDate" = null
    WHERE ub."userId" = $1;`,
      [userId],
    );

    return; //userResult[1] === 1 && userBanResult[1] === 1;
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
    return user[0];
  }

  async findUserById(userId: string) {
    try {
      const user = await this.dataSource.query(
        `SELECT u.*,ub."banDate",ub."banReason",ec."confirmationCode", ec."emailExpiration"
                FROM public.users u
                left join public.users_ban_by_sa ub on
                u."id" = ub."userId"
                left join public.email_confirmation ec on
                u."id" = ec."userId"
                where u."id" = $1`,
        [userId],
      );
      if (!user) return null;
      return user[0];
    } catch (e) {
      return null;
    }
  }
}
