import { BlogRepository } from '../../infrastructure/blogs/blog.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModelType } from '../../entities/blog.entity';
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
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
  ) {}

  async execute(command: BlogCreateCommand): Promise<string> {
    const user = await this.usersRepository.findUserById(command.userId);

    const blogId = this.blogRepository.createBlog(
      user.id,
      user.login,
      command.createBlogDto,
    );

    // const newBlog: BlogDocument = this.BlogModel.createBlog(
    //   user.id,
    //   user.accountData.login,
    //   command.createBlogDto,
    //   this.BlogModel,
    // );

    //await this.blogRepository.save(newBlog);

    return blogId;
  }
}
