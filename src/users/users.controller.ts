import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { UserQueryRepo } from './users.query.repo';
import { UserService } from './users.service';
import { PaginationType } from '../types/pagination.type';
import { CreateUserDto } from './createUser.Dto';
import { getPaginationValues } from '../pagination.values.function';

@Controller('users')
export class UserController {
  constructor(
    protected userQueryRepo: UserQueryRepo,
    protected userService: UserService,
  ) {}

  @Get()
  async getUsers(@Query() query: PaginationType) {
    const paginatedQuery: PaginationType = getPaginationValues({
      ...query,
      sortBy: `accountData.${query.sortBy}`,
      searchLoginTerm: `accountData.${query.searchLoginTerm}`,
      searchEmailTerm: `accountData.${query.searchEmailTerm}`,
    });

    const users = await this.userQueryRepo.getUsers(
      paginatedQuery.sortBy,
      paginatedQuery.sortDirection,
      paginatedQuery.pageNumber,
      paginatedQuery.pageSize,
      paginatedQuery.searchLoginTerm,
      paginatedQuery.searchEmailTerm,
    );
    return users;
    // res.status(200).send(getUsers);
  }

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    const newUser = await this.userService.createNewUser(createUserDto);
    if (newUser) {
      return newUser;
      // res.status(201).send(newUser);
    }
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteUser(@Param('id') userId: string) {
    const deleteUser = await this.userService.deleteUser(userId);

    if (!deleteUser) {
      throw new HttpException('Not Found', 404);
    }
    return;
    // res.sendStatus(204);
  }
}
