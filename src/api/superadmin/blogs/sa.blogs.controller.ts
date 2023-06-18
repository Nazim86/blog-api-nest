import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { BindBlogCommand } from './bind-blog-use-case';
import { PaginationType } from '../../../common/pagination';
import { BlogPagination } from '../../infrastructure/blogs/blog-pagination';
import { BlogsQueryRepo } from '../../infrastructure/blogs/blogs-query.repository';
import { exceptionHandler } from '../../../exception-handler/exception-handler';
import { ResultCode } from '../../../exception-handler/result-code-enum';
import { BasicAuthGuard } from '../../public/auth/guards/basic-auth.guard';
import { BanBlogCommand } from './ban-blog-use-case';
import { BanBlogInputModel } from './inputModel/banBlog-input-model';
import { RoleEnum } from '../../../enums/role-enum';

@Controller('sa/blogs')
@UseGuards(BasicAuthGuard)
export class SuperAdminBlogsController {
  constructor(
    private commandBus: CommandBus,
    private readonly blogsQueryRepo: BlogsQueryRepo,
  ) {}
  @Get()
  async getBlogs(@Query() query: BlogPagination<PaginationType>) {
    return await this.blogsQueryRepo.getBlog(query, RoleEnum.SA);
  }

  @Put(':blogId/bind-with-user/:userId')
  @HttpCode(204)
  async bindBlogWithUser(@Param() params) {
    const isBlogBound = await this.commandBus.execute(
      new BindBlogCommand(params.blogId, params.userId),
    );

    if (isBlogBound.code !== ResultCode.Success) {
      return exceptionHandler(ResultCode.BadRequest, isBlogBound.data);
    }
    return;
  }

  @Put(':id/ban')
  async banBlog(
    @Param('id') blogId: string,
    @Body() banStatus: BanBlogInputModel,
  ) {
    const isBlogBanned = await this.commandBus.execute(
      new BanBlogCommand(blogId, banStatus),
    );

    if (isBlogBanned.code !== ResultCode) {
      return exceptionHandler(isBlogBanned.code);
    }
    return;
  }
}
