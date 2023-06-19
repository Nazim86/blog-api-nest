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

import { BlogsQueryRepo } from '../infrastructure/blogs/blogs-query.repository';
import { PaginationType } from '../../common/pagination';
import { exceptionHandler } from '../../exception-handler/exception-handler';
import { ResultCode } from '../../exception-handler/result-code-enum';
import { CommandBus } from '@nestjs/cqrs';
import { AccessTokenGuard } from '../public/auth/guards/access-token.guard';
import { Result } from '../../exception-handler/result-type';

import { UserBanDto } from './inputModel-Dto/userBan.dto';
import { BloggerBanUserCommand } from './application,use-cases/blogger-ban-user-use-case';
import { UserQueryRepo } from '../infrastructure/users/users.query.repo';
import { UserPagination } from '../superadmin/users/user-pagination';
import { UserId } from '../../decorators/UserId';

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
    @UserId() userId,
    @Query()
    query: UserPagination<PaginationType>,
    @Param('id') blogId: string,
  ) {
    const getBannedUsersForBlog =
      await this.usersQueryRepo.getBannedUsersForBlog(userId, query, blogId);

    if (getBannedUsersForBlog.code !== ResultCode.Success) {
      return exceptionHandler(getBannedUsersForBlog.code);
    }

    return getBannedUsersForBlog.data;
  }

  @HttpCode(204)
  @Put(':userId/ban')
  async banUser(
    @Param('userId') userId: string,
    @Body() userBanDto: UserBanDto,
  ) {
    const isUpdated: Result<ResultCode> = await this.commandBus.execute(
      new BloggerBanUserCommand(userId, userBanDto),
    );

    if (isUpdated.code !== ResultCode.Success) {
      return exceptionHandler(isUpdated.code);
    }
    return;
  }
}
