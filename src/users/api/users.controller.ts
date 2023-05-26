import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserQueryRepo } from '../infrastructure/users.query.repo';
import { UsersService } from '../application/users.service';
import { CreateUserDto } from '../createUser.Dto';
import { UserPagination } from '../user-pagination';
import { BasicAuthGuard } from '../../auth/guards/basic-auth.guard';
import { PaginationType } from '../../common/pagination';
import { exceptionHandler } from '../../exception-handler/exception-handler';
import { ResultCode } from '../../exception-handler/result-code-enum';

//@UseGuards(BasicAuthGuard)
@Controller('users')
export class UserController {
  constructor(
    protected userQueryRepo: UserQueryRepo,
    protected userService: UsersService,
  ) {}

  @UseGuards(BasicAuthGuard)
  @Get()
  async getUsers(@Query() query: UserPagination<PaginationType>) {
    return await this.userQueryRepo.getUsers(query);
  }
  @UseGuards(BasicAuthGuard)
  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    const userId = await this.userService.createNewUser(createUserDto);
    if (userId) {
      return await this.userQueryRepo.getUserById(userId);
    }
  }
  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(204)
  async deleteUser(@Param('id') userId: string) {
    const deleteUser = await this.userService.deleteUser(userId);

    if (!deleteUser) {
      return exceptionHandler(ResultCode.NotFound);
    }
    return;
    // res.sendStatus(204);
  }
}
