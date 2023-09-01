import { CommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../infrastructure/users/users.repository';
import { CreateUserDto } from '../dto/createUser.Dto';

import { CreateUserTransaction } from '../../../../common/createUserTransaction';

export class CreateUsersCommand {
  constructor(public createUserDto: CreateUserDto) {}
}
// @CommandHandler(CreateUsersCommand)
// export class CreateUsersUseCase {
//   constructor(private readonly usersRepository: UsersRepository) {}
//
//   async execute(command: CreateUsersCommand) {
//     const passwordHash = await bcrypt.hash(
//       command.createUserDto.password,
//       Number(process.env.SALT_ROUND),
//     );
//
//     const newUser = new Users();
//     newUser.login = command.createUserDto.login;
//     newUser.passwordHash = passwordHash;
//     newUser.email = command.createUserDto.email;
//     newUser.createdAt = new Date().toISOString();
//     newUser.isConfirmed = true;
//
//     const user = await this.usersRepository.saveUser(newUser);
//
//     const usersBanBySA = new UsersBanBySa();
//
//     usersBanBySA.user = user;
//     usersBanBySA.isBanned = false;
//
//     const result = await this.usersRepository.saveUsersBanBySA(usersBanBySA);
//     //console.log(result);
//     return user.id;
//   }
// }

@CommandHandler(CreateUsersCommand)
export class CreateUsersUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly createUserTransaction: CreateUserTransaction,
  ) {}

  // this is a function that allows us to use other "transaction" classes
  // inside of any other "main" transaction, i.e. without creating a new DB transaction

  async execute(command: CreateUsersCommand) {
    const userWithBanInfo = await this.createUserTransaction.run(
      command.createUserDto,
    );

    // const passwordHash = await bcrypt.hash(
    //   command.createUserDto.password,
    //   Number(process.env.SALT_ROUND),
    // );
    //
    // const newUser = new Users();
    // newUser.login = command.createUserDto.login;
    // newUser.passwordHash = passwordHash;
    // newUser.email = command.createUserDto.email;
    // newUser.createdAt = new Date().toISOString();
    // newUser.isConfirmed = true;
    //
    // const user = await this.usersRepository.saveUser(newUser);
    //
    // const usersBanBySA = new UsersBanBySa();
    //
    // usersBanBySA.user = user;
    // usersBanBySA.isBanned = false;
    //
    // const result = await this.usersRepository.saveUsersBanBySA(usersBanBySA);
    //console.log(result);
    return userWithBanInfo.user.id;
  }
}

// @CommandHandler(CreateUsersCommand)
// export abstract class BaseTransaction<TransactionInput, TransactionOutput> {
//   protected constructor(private readonly dataSource: DataSource) {}
//
//   // this function will contain all of the operations that you need to perform
//   // and has to be implemented in all transaction classes
//   protected abstract execute(
//     data: TransactionInput,
//     manager: EntityManager,
//   ): Promise<TransactionOutput>;
//
//   private async createRunner(): Promise<QueryRunner> {
//     return this.dataSource.createQueryRunner();
//   }
//
//   // this is the main function that runs the transaction
//   async run(data: TransactionInput): Promise<TransactionOutput> {
//     // since everything in Nest.js is a singleton we should create a separate
//     // QueryRunner instance for each call
//     const queryRunner = await this.createRunner();
//     await queryRunner.connect();
//     await queryRunner.startTransaction();
//
//     try {
//       const result = await this.execute(data, queryRunner.manager);
//       await queryRunner.commitTransaction();
//       return result;
//     } catch (error) {
//       await queryRunner.rollbackTransaction();
//       throw new Error('Transaction failed');
//     } finally {
//       await queryRunner.release();
//     }
//   }
//
//   // this is a function that allows us to use other "transaction" classes
//   // inside of any other "main" transaction, i.e. without creating a new DB transaction
//   async runWithinTransaction(
//     data: TransactionInput,
//     manager: EntityManager,
//   ): Promise<TransactionOutput> {
//     return this.execute(data, manager);
//   }
// }
