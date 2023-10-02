// import { Injectable } from '@nestjs/common';
// import { DataSource, EntityManager } from 'typeorm';
// import { BaseTransaction } from '../../../common/baseTransaction';
// import { Blogs } from '../../entities/blogs/blogs.entity';
// import { BlogBanInfo } from '../../entities/blogs/blogBanInfo.entity';
// import { BlogCreateCommand } from './blog-create-use-case';
// import { UsersRepository } from '../../infrastructure/users/users.repository';
//
// // interface UserData {
// //   name: string;
// //   email: string;
// // }
// //
// // interface UserWithBalance {
// //   userId: number;
// //   balanceId: number;
// // }
//
// @Injectable()
// export class CreateBlogTransaction extends BaseTransaction<
//   BlogCreateCommand,
//   Blogs
// > {
//   constructor(
//     dataSource: DataSource,
//     private readonly usersRepository: UsersRepository,
//   ) {
//     super(dataSource);
//   }
//
//   // the important thing here is to use the manager that we've created in the base class
//   protected async execute(
//     command: BlogCreateCommand,
//     manager: EntityManager,
//   ): Promise<Blogs> {
//     const user = await this.usersRepository.findUserById(command.userId);
//
//     let blog = new Blogs();
//
//     blog.name = command.createBlogDto.name;
//     blog.description = command.createBlogDto.description;
//     blog.websiteUrl = command.createBlogDto.websiteUrl;
//     blog.createdAt = new Date().toISOString();
//     blog.isMembership = false;
//     blog.owner = user; //command.userId;
//
//     const blogBanInfo = new BlogBanInfo();
//
//     blogBanInfo.isBanned = false;
//     blogBanInfo.banDate = null;
//     blogBanInfo.blog = blog;
//
//     blog = await manager.save(blog);
//     manager.save(blogBanInfo); // const newUser = await manager.create(User, data);
//     // const userBalance = await manager.create(Balance, { userId: newUser.id });
//
//     return blog;
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
