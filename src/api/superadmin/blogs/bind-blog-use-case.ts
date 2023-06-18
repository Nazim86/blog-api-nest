import { InjectModel } from '@nestjs/mongoose';
import { CommandHandler } from '@nestjs/cqrs';
import { UserDocument } from '../../entities/user.entity';
import { UsersRepository } from '../../infrastructure/users/users.repository';
import { Blog, BlogDocument, BlogModelType } from '../../entities/blog.entity';
import { BlogRepository } from '../../infrastructure/blogs/blog.repository';
import { ResultCode } from '../../../exception-handler/result-code-enum';
import { Result } from '../../../exception-handler/result-type';

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

  async execute(command: BindBlogCommand): Promise<BlogDocument | Result<any>> {
    const user: UserDocument = await this.usersRepository.findUserById(
      command.userId,
    );

    if (!user) {
      const errorMessage = {
        message: [{ message: 'wrong userId', field: 'userId' }],
      };
      return {
        code: ResultCode.BadRequest,
        data: errorMessage,
      };
    }

    const blog: BlogDocument = await this.blogRepository.getBlogById(
      command.blogId,
    );

    if (!blog) {
      const errorMessage = {
        message: [{ message: 'wrong blogId', field: 'blogId' }],
      };
      return {
        code: ResultCode.BadRequest,
        data: errorMessage,
      };
    }

    if (blog.blogOwnerInfo.userId === user.id) {
      const errorMessage = {
        message: [{ message: 'Already bound', field: 'blogOwner' }],
      };
      return {
        code: ResultCode.BadRequest,
        data: errorMessage,
      };
    }

    blog.bindBlogWithUser(user.id, user.accountData.login);

    await this.blogRepository.save(blog);

    return { code: ResultCode.Success };
  }
}
