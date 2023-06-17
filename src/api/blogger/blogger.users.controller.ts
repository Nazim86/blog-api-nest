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

import { BlogsQueryRepo } from '../public/blogs/infrastructure/blogs-query.repository';
import { PaginationType } from '../../common/pagination';
import { exceptionHandler } from '../../exception-handler/exception-handler';
import { ResultCode } from '../../exception-handler/result-code-enum';
import { CommandBus } from '@nestjs/cqrs';
import { AccessTokenGuard } from '../public/auth/guards/access-token.guard';
import { Result } from '../../exception-handler/result-type';

import { UserBanDto } from './inputModel-Dto/userBan.dto';
import { UserBanByBloggerCommand } from './application,use-cases/user-ban-by-blogger-use-case';
import { UserQueryRepo } from '../superadmin/users/infrastructure/users.query.repo';
import { UserPagination } from '../superadmin/users/user-pagination';

@UseGuards(AccessTokenGuard)
@Controller('blogger/users')
export class BloggerUsersController {
  constructor(
    private commandBus: CommandBus,
    private readonly blogQueryRepo: BlogsQueryRepo,
    private readonly usersQueryRepo: UserQueryRepo,
  ) {}

  @Get('blog/:id')
  async getBannedUsersForBlog(
    @Query()
    query: UserPagination<PaginationType>,
    @Param('id') blogId: string,
  ) {
    const getBannedUsersForBlog =
      await this.usersQueryRepo.getBannedUsersForBlog(query, blogId);

    return getBannedUsersForBlog;
  }

  @HttpCode(204)
  @Put(':userId/ban')
  async banUser(
    @Param('userId') userId: string,
    @Body() userBanDto: UserBanDto,
  ) {
    const isUpdated: Result<ResultCode> = await this.commandBus.execute(
      new UserBanByBloggerCommand(userId, userBanDto),
    );

    if (isUpdated.code !== ResultCode.Success) {
      return exceptionHandler(isUpdated.code);
    }
    return;
  }
}
