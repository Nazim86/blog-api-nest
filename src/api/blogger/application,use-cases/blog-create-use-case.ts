import { BlogRepository } from '../../infrastructure/blogs/blog.repository';
import { CreateBlogDto } from '../inputModel-Dto/createBlog.dto';
import { CommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infrastructure/users/users.repository';
import { Blogs } from '../../entities/blogs/blogs.entity';
import { BlogBanInfo } from '../../entities/blogs/blogBanInfo.entity';

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

    // const blogId = this.blogRepository.createBlog(
    //   user.id,
    //   user.login,
    //   command.createBlogDto,
    // );

    const blog = await this.blogRepository.saveBlog(newBlog);

    const blogBanInfo = new BlogBanInfo();

    blogBanInfo.isBanned = false;
    blogBanInfo.banDate = null;
    blogBanInfo.blog = blog;

    await this.blogRepository.saveBlogBanInfo(blogBanInfo);

    return blog.id;
  }
}
