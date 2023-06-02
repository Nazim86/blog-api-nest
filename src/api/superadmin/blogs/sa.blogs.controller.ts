import { Controller, Get, Param, Put, Query } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { BindBlogCommand } from './bind-blog-use-case';
import { PaginationType } from '../../../common/pagination';
import { BlogPagination } from '../../../blogs/domain/blog-pagination';
import { BlogsQueryRepo } from '../../../blogs/infrastructure/blogs-query.repository';
import { exceptionHandler } from '../../../exception-handler/exception-handler';
import { ResultCode } from '../../../exception-handler/result-code-enum';

@Controller('sa/blogs')
export class SuperAdminBlogsController {
  constructor(
    private commandBus: CommandBus,
    private readonly blogsQueryRepo: BlogsQueryRepo,
  ) {}
  @Get()
  async getBlogs(@Query() query: BlogPagination<PaginationType>) {
    return await this.blogsQueryRepo.getBlog(query, 'SA');
  }

  @Put(':blogId/bind-with-user/:userId')
  async bindBlogWithUser(@Param() params) {
    const isBlogBinded = await this.commandBus.execute(
      new BindBlogCommand(params.blogId, params.userId),
    );

    if (!isBlogBinded) {
      return exceptionHandler(ResultCode.BadRequest);
    }
  }
}
