import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { add } from 'date-fns';
import { UserBanDto } from '../../blogger/inputModel-Dto/userBan.dto';
import { Users } from '../../entities/users/user.entity';
import { EmailConfirmation } from '../../entities/users/email-confirmation';
import { UsersBanBySa } from '../../entities/users/users-ban-by-sa.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(Users) private readonly usersRepo: Repository<Users>,
    @InjectRepository(UsersBanBySa)
    private readonly usersBanBySaRepository: Repository<UsersBanBySa>,
  ) {}

  async saveUser(newUser: Users) {
    return this.usersRepo.save(newUser);
  }

  async saveEmailConfirmation(emailConfirmation: EmailConfirmation) {
    return await this.usersRepo.save(emailConfirmation);
  }

  async saveUsersBanBySA(usersBanBySA: UsersBanBySa) {
    return this.usersBanBySaRepository.save(usersBanBySA);
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

  async findUserByRecoveryCode(recoveryCode: string) {
    const user = await this.dataSource.query(
      `SELECT pr.*, u.*
                FROM public.password_recovery pr
                Left join public.users u on
                u."id" = pr."userId"
                Where pr."recoveryCode"=$1`,
      [recoveryCode],
    );
    return user[0];
  }

  async createRecoveryCode(userId: string, recoveryCode: string) {
    return await this.dataSource.query(
      `INSERT INTO public.password_recovery(
            "userId", "recoveryCode", "recoveryCodeExpiration")
            VALUES ($1, $2, $3);`,
      [
        userId,
        recoveryCode,
        add(new Date(), {
          hours: 1,
          minutes: 3,
        }),
      ],
    );
  }

  async setNewPassword(userId: string, passwordHash: string) {
    const isUserUpdated = await this.dataSource.query(
      `UPDATE public.users u
                SET  "passwordHash"=$1
                WHERE u."id" = $2;`,
      [passwordHash, userId],
    );
    const isPasswordRecoveryUpdated = await this.dataSource.query(
      `UPDATE public.password_recovery pr
                        SET "userId"=null, "recoveryCode"=null, "recoveryCodeExpiration"=null
                        WHERE pr."userId"= $1;`,
      [userId],
    );

    return isUserUpdated[1] === 1 && isPasswordRecoveryUpdated[1] === 1;
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
  }

  async findBloggerBannedUser(userId: string, blogId: string) {
    const bannedUser = await this.dataSource.query(
      `Select * from public.users_ban_by_blogger ubb
              Left join public.users u on
              ubb."userId" = u."id"
              Where ubb."userId"=$1 and ubb."blogId"=$2 and ubb."isBanned" = $3`,
      [userId, blogId, true],
    );

    return bannedUser[0];
  }

  async bloggerBanUser(userId: string, userBanDto: UserBanDto, blogId: string) {
    await this.dataSource.query(
      `Insert into public.users_ban_by_blogger("isBanned", "banDate", "banReason", "blogId", "userId")
                values($1,$2,$3,$4,$5)
      on conflict ("blogId","userId")
      do Update set "isBanned"=Excluded."isBanned", "banDate"=$2,
      "banReason"=Excluded."banReason", "blogId"=Excluded."blogId",
      "userId"=Excluded."userId"`,
      [
        userBanDto.isBanned,
        new Date().toISOString(),
        userBanDto.banReason,
        blogId,
        userId,
      ],
    );

    return true;
  }

  // async banUser(userId, banUserDto: BanUserDto) {
  //   const result = await this.dataSource.query(
  //     `UPDATE public.users_ban_by_sa ub
  //   SET "banReason"=$1, "banDate" = $2, "isBanned"=$3
  //   WHERE ub."userId" = $4;`,
  //     [
  //       banUserDto.banReason,
  //       new Date().toISOString(),
  //       banUserDto.isBanned,
  //       userId,
  //     ],
  //   );
  //
  //   return result[1] === 1;
  // }

  async unBanUser(userId) {
    // await this.dataSource.query(
    //   `UPDATE public.users u SET "isBanned"=false
    //  WHERE u."id" = $1;`,
    //   [userId],
    // );

    const result = await this.dataSource.query(
      `UPDATE public.users_ban_by_sa ub
    SET "isBanned"=false, "banReason"=null, "banDate" = null
    WHERE ub."userId" = $1;`,
      [userId],
    );

    return result[1] === 1;
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      const result = await this.dataSource.query(
        `DELETE FROM public."users" u WHERE u."id" = $1;`,
        [id],
      );
      return result[1] === 1;
    } catch (e) {
      return false;
    }
  }

  async findUserByLoginOrEmail(loginOrEmail: string) {
    // .where('u.id = ec.userId')
    //     .andWhere('u.id = pr.userId')
    //     .andWhere('u.id = ub.userId')

    //   .query(
    //   `SELECT u.*, ec."confirmationCode",ec."emailExpiration",
    // pr."recoveryCode", pr."recoveryCodeExpiration", ubb."isBanned"
    // FROM public.users u
    // Left join public.email_confirmation ec on
    // ec."userId" = u."id"
    // Left Join public.password_recovery pr on
    // pr."userId"=u."id"
    // Left join public.users_ban_by_sa ubb on
    // u."id" = ubb."userId"
    // where u."login"= $1 OR u."email" = $1;`,
    //   [loginOrEmail],
    // );

    return await this.usersRepo
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.emailConfirmation', 'ec')
      .leftJoinAndSelect('u.passwordRecovery', 'pr')
      .leftJoinAndSelect('u.banInfo', 'ub')
      .where('u.login = :login or u.email = :email', {
        login: loginOrEmail,
        email: loginOrEmail,
      })
      .getOne();
  }

  async findUserById(userId: string) {
    const user = await this.usersRepo
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.banInfo', 'bi')
      .leftJoinAndSelect('u.emailConfirmation', 'ec')
      .where('u.id = :userId', { userId: userId })
      .getOne();

    //   .query(
    //   `SELECT u.*,ub."banDate",ub."banReason",ub."isBanned",ec."confirmationCode", ec."emailExpiration"
    //             FROM public.users u
    //             left join public.users_ban_by_sa ub on
    //             u."id" = ub."userId"
    //             left join public.email_confirmation ec on
    //             u."id" = ec."userId"
    //             where u."id" = $1`,
    //   [userId],
    // );
    if (!user) return null;

    return user;
  }
}
