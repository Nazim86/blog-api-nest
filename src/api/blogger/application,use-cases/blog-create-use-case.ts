import { BlogRepository } from '../../public/blogs/infrastructure/blog.repository';
import { InjectModel } from '@nestjs/mongoose';
import {
  Blog,
  BlogDocument,
  BlogModelType,
} from '../../public/blogs/domain/blog.entity';
import { CreateBlogDto } from '../createBlog.dto';
import { CommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../superadmin/users/infrastructure/users.repository';
import { UserDocument } from '../../superadmin/users/domain/user.entity';

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
    const user: UserDocument = await this.usersRepository.findUserById(
      command.userId,
    );
    const newBlog: BlogDocument = this.BlogModel.createBlog(
      user.id,
      user.accountData.login,
      command.createBlogDto,
      this.BlogModel,
    );
    await this.blogRepository.save(newBlog);

    return newBlog.id;
  }
}
