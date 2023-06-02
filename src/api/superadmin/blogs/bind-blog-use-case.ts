import { InjectModel } from '@nestjs/mongoose';
import { CommandHandler } from '@nestjs/cqrs';
import { UserDocument } from '../../../users/domain/user.entity';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import {
  Blog,
  BlogDocument,
  BlogModelType,
} from '../../../blogs/domain/blog.entity';
import { BlogRepository } from '../../../blogs/infrastructure/blog.repository';

export class BindBlogCommand {
  constructor(public blogId: string, public userId: string) {}
}

@CommandHandler(BindBlogCommand)
export class BindBlogUseCase {
  constructor(
    private readonly blogRepository: BlogRepository,
    private readonly usersRepository: UsersRepository,
    @InjectModel(Blog.name) private BlogModel: BlogModelType,
  ) {}

  async execute(command: BindBlogCommand): Promise<BlogDocument | null> {
    const user: UserDocument = await this.usersRepository.findUserById(
      command.userId,
    );
    if (!user) return null;

    const blog: BlogDocument = await this.blogRepository.getBlogById(
      command.blogId,
    );

    if (!blog) return null;

    blog.bindBlogWithUser(user.id, user.accountData.login);

    return await this.blogRepository.save(blog);
  }
}
