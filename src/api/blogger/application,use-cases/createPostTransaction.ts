// import { Injectable } from '@nestjs/common';
// import { DataSource, EntityManager } from 'typeorm';
// import { CreatePostDto } from '../../public/post/createPostDto';
//
// @Injectable()
// export class CreatePostTransaction extends BaseTransaction<
//   CreatePostDto,
//   UserWithBanInfo
// > {
//   constructor(dataSource: DataSource) {
//     super(dataSource);
//   }
//
//   // the important thing here is to use the manager that we've created in the base class
//   protected async execute(
//     createBlogDto: CreateBlogDto,
//     manager: EntityManager,
//   ): Promise<UserWithBanInfo> {
//     const passwordHash = await bcrypt.hash(
//       createBlogDto.password,
//       Number(process.env.SALT_ROUND),
//     );
//
//     let user = new Users();
//     user.login = createUserDto.login;
//     user.passwordHash = passwordHash;
//     user.email = createUserDto.email;
//     user.createdAt = new Date().toISOString();
//     user.isConfirmed = true;
//
//     let usersBanBySA = new UsersBanBySa();
//
//     usersBanBySA.user = user;
//     usersBanBySA.isBanned = false;
//
//     user = await manager.save(user);
//     usersBanBySA = await manager.save(usersBanBySA);
//     //console.log(result);
//     return {
//       user: user,
//       usersBanBySA: usersBanBySA,
//     };
//     // const newUser = await manager.create(User, data);
//     // const userBalance = await manager.create(Balance, { userId: newUser.id });
//     // return {
//     //   userId: newUser.id,
//     //   balanceId: userBalance.id,
//     // };
//   }
// }
// //
// // @Injectable()
// // export class UserService {
// //   constructor(private readonly createUserTransaction: CreateUserTransaction) {}
// //
// //   async createUser(user: Users): Promise<string> {
// //     const createdUserData = await this.createUserTransaction.run(user);
// //     return createdUserData;
// //   }
// // }
