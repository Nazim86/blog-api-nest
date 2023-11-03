import { CreateBlogDto } from '../inputModel-Dto/createBlog.dto';
import { CommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infrastructure/users/users.repository';
import { Blogs } from '../../entities/blogs/blogs.entity';
import { BlogBanInfo } from '../../entities/blogs/blogBanInfo.entity';
import { BlogRepository } from '../../infrastructure/blogs/blog.repository';

export class BlogCreateCommand {
  constructor(public userId: string, public createBlogDto: CreateBlogDto) {}
}
@CommandHandler(BlogCreateCommand)
export class BlogCreateUseCase {
  constructor(
    private readonly blogRepository: BlogRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(command: BlogCreateCommand) {
    const user = await this.usersRepository.findUserById(command.userId);

    if (!user) return false;

    const newBlog = new Blogs();
    newBlog.name = command.createBlogDto.name;
    newBlog.description = command.createBlogDto.description;
    newBlog.websiteUrl = command.createBlogDto.websiteUrl;
    newBlog.createdAt = new Date().toISOString();
    newBlog.isMembership = false;
    newBlog.owner = user;

    const blog = await this.blogRepository.saveBlog(newBlog);

    const blogBanInfo = new BlogBanInfo();

    blogBanInfo.isBanned = false;
    blogBanInfo.banDate = null;
    blogBanInfo.blog = blog;

    await this.blogRepository.saveBlogBanInfo(blogBanInfo);

    return blog.id;
  }
}
// @CommandHandler(BlogCreateCommand)
// export class BlogCreateUseCase extends BaseTransaction<
//   BlogCreateCommand,
//   Blogs
// > {
//   constructor(
//     dataSource: DataSource,
//     private readonly usersRepository: UsersRepository,
//     private readonly transactionRepository: TransactionRepository,
//   ) {
//     super(dataSource);
//   }
//
//   protected async doLogic(
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
//     blog = await this.transactionRepository.save(blog, manager);
//     await this.transactionRepository.save(blogBanInfo, manager); // const newUser = await manager.create(User, data);
//     // const userBalance = await manager.create(Balance, { userId: newUser.id });
//
//     return blog;
//   }
//
//   async execute(command: BlogCreateCommand) {
//     // const user = await this.usersRepository.findUserById(command.userId);
//     //
//     // if (!user) return false;
//
//     //const blog = await this.createBlogTransaction.run(command);
//
//     return super.run(command);
//   }
// }
