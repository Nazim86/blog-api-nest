import { BlogRepository } from '../../infrastructure/blogs/blog.repository';
import { CreateBlogDto } from '../inputModel-Dto/createBlog.dto';
import { CommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infrastructure/users/users.repository';

export class BlogCreateCommand {
  constructor(public userId: string, public createBlogDto: CreateBlogDto) {}
}
@CommandHandler(BlogCreateCommand)
export class BlogCreateUseCase {
  constructor(
    private readonly blogRepository: BlogRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(command: BlogCreateCommand): Promise<string> {
    const user = await this.usersRepository.findUserById(command.userId);

    const blogId = this.blogRepository.createBlog(
      user.id,
      user.login,
      command.createBlogDto,
    );

    return blogId;
  }
}
