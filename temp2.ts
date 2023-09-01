// import { User, Balance } from './entities';
// import { Injectable } from '@nestjs/common';
// import { Connection, EntityManager } from 'typeorm';
// import { BaseTransaction } from './temp';
//
// interface UserData {
//   name: string;
//   email: string;
// }
//
// interface UserWithBalance {
//   userId: number;
//   balanceId: number;
// }
//
// @Injectable()
// class CreateUserTransaction extends BaseTransaction<UserData, UserWithBalance> {
//   constructor(connection: Connection) {
//     super(connection);
//   }
//
//   // the important thing here is to use the manager that we've created in the base class
//   protected async execute(
//     data: UserData,
//     manager: EntityManager,
//   ): Promise<UserWithBalance> {
//     const newUser = await manager.create(User, data);
//     const userBalance = await manager.create(Balance, { userId: newUser.id });
//     return {
//       userId: newUser.id,
//       balanceId: userBalance.id,
//     };
//   }
// }
//
// @Injectable()
// export class UserService {
//   constructor(private readonly createUserTransaction: CreateUserTransaction) {}
//
//   async createUser(user: UserData): Promise<UserWithBalance> {
//     const createdUserData = await this.createUserTransaction.run(user);
//     return createdUserData;
//   }
// }
