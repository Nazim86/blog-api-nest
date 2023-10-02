import { CommandHandler } from '@nestjs/cqrs';
import { CreateUserDto } from '../dto/createUser.Dto';
import { BaseTransaction } from '../../../../common/baseTransaction';
import { DataSource, EntityManager } from 'typeorm';
import * as bcrypt from 'bcrypt';
import process from 'process';
import { Users } from '../../../entities/users/user.entity';
import { UsersBanBySa } from '../../../entities/users/users-ban-by-sa.entity';
import { UsersBanByBlogger } from '../../../entities/users/usersBanByBlogger.entity';
import { TransactionRepository } from '../../../infrastructure/common/transaction.repository';

export class CreateUsersCommand {
  constructor(public createUserDto: CreateUserDto) {}
}

@CommandHandler(CreateUsersCommand)
export class CreateUsersUseCase extends BaseTransaction<CreateUserDto, string> {
  constructor(
    dataSource: DataSource,
    private readonly transactionRepository: TransactionRepository,
  ) {
    super(dataSource);
  }

  protected async doLogic(
    createUserDto: CreateUserDto,
    manager: EntityManager,
  ): Promise<string> {
    const passwordHash = await bcrypt.hash(
      createUserDto.password,
      Number(process.env.SALT_ROUND),
    );

    let user = new Users();
    user.login = createUserDto.login;
    user.passwordHash = passwordHash;
    user.email = createUserDto.email;
    user.createdAt = new Date().toISOString();
    user.isConfirmed = true;

    const usersBanBySA = new UsersBanBySa();

    usersBanBySA.user = user;
    usersBanBySA.isBanned = false;

    const usersBanByBlogger = new UsersBanByBlogger();
    usersBanByBlogger.user = user;
    usersBanByBlogger.isBanned = false;

    user = await this.transactionRepository.save(user, manager);
    await this.transactionRepository.save(usersBanBySA, manager);
    await this.transactionRepository.save(usersBanByBlogger, manager);
    //console.log(user);
    //console.log(result);
    return user.id;
    // const newUser = await manager.create(User, data);
    // const userBalance = await manager.create(Balance, { userId: newUser.id });
    // return {
    //   userId: newUser.id,
    //   balanceId: userBalance.id,
    // };
  }

  // this is a function that allows us to use other "transaction" classes
  // inside of any other "main" transaction, i.e. without creating a new DB transaction

  async execute(command: CreateUsersCommand) {
    // const userWithBanInfo: UserWithBanInfo =
    //   await this.createUserTransaction.run(command.createUserDto);

    return super.run(command.createUserDto); //userWithBanInfo.user.id;
  }
}
