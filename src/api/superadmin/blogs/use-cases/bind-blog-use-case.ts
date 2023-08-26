import { CommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../infrastructure/users/users.repository';
import { BlogRepository } from '../../../infrastructure/blogs/blog.repository';
import { ResultCode } from '../../../../exception-handler/result-code-enum';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export class BindBlogCommand {
  constructor(public blogId: string, public userId: string) {}
}

@CommandHandler(BindBlogCommand)
export class BindBlogUseCase {
  constructor(
    private readonly blogRepository: BlogRepository,
    private readonly usersRepository: UsersRepository,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async execute(command: BindBlogCommand) {
    const user = await this.usersRepository.findUserById(command.userId);

    if (!user) {
      const errorMessage = {
        message: [{ message: 'wrong userId', field: 'userId' }],
      };
      return {
        code: ResultCode.BadRequest,
        data: errorMessage,
      };
    }

    const blog = await this.blogRepository.getBlogById(command.blogId);

    if (!blog) {
      const errorMessage = {
        message: [{ message: 'wrong blogId', field: 'blogId' }],
      };
      return {
        code: ResultCode.BadRequest,
        data: errorMessage,
      };
    }

    if (blog.owner.id === user.id) {
      const errorMessage = {
        message: [{ message: 'Already bound', field: 'blogOwner' }],
      };
      return {
        code: ResultCode.BadRequest,
        data: errorMessage,
      };
    }

    blog.owner = user;
    const isBound = await this.blogRepository.saveBlog(blog);

    // const isBound = await this.blogRepository.bindBlogWithUser(
    //   user.id,
    //   user.login,
    //   blog.id,
    // );

    return { code: isBound ? ResultCode.Success : ResultCode.NotFound };
  }
}
