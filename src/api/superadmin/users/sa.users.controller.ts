import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BanUserDto } from './dto/banUserDto';
import { CommandBus } from '@nestjs/cqrs';
import { BanUserCommand } from './application,use-cases/ban-user-use-case';
import { exceptionHandler } from '../../../exception-handler/exception-handler';
import { ResultCode } from '../../../exception-handler/result-code-enum';
import { UserQueryRepo } from '../../infrastructure/users/users.query.repo';
import { UserPagination } from './user-pagination';
import { PaginationType } from '../../../common/pagination';
import { BasicAuthGuard } from '../../public/auth/guards/basic-auth.guard';
import { CreateUserDto } from './dto/createUser.Dto';
import { CreateUsersCommand } from './application,use-cases/create-user-use-case';
import { DeleteUserCommand } from './application,use-cases/delete-user-use-case';

@UseGuards(BasicAuthGuard)
@Controller('sa/users')
export class SuperAdminUsersController {
  constructor(
    private commandBus: CommandBus,
    private readonly usersQueryRepo: UserQueryRepo,
  ) {}
  @Put(':userId/ban')
  async banUser(@Param('userId') userId, @Body() banUserDto: BanUserDto) {
    const isUserBanned = await this.commandBus.execute(
      new BanUserCommand(userId, banUserDto),
    );

    if (isUserBanned.code !== ResultCode.Success) {
      return exceptionHandler(ResultCode.BadRequest, isUserBanned.data);
    }

    return;
  }

  @Get()
  async getUsers(@Query() query: UserPagination<PaginationType>) {
    const users = await this.usersQueryRepo.getUsers(query, 'SA');
    return users;
  }

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    const userId = await this.commandBus.execute(
      new CreateUsersCommand(createUserDto),
    );
    console.log(userId);
    if (userId) {
      return await this.usersQueryRepo.getUserById(userId);
    }
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteUser(@Param('id') userId: string) {
    const deleteUser = await this.commandBus.execute(
      new DeleteUserCommand(userId),
    );

    if (!deleteUser) {
      return exceptionHandler(ResultCode.NotFound);
    }
    return;
  }
}
