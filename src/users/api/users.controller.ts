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
  UseGuards,
} from '@nestjs/common';
import { UserQueryRepo } from '../infrastructure/users.query.repo';
import { UsersService } from '../application/users.service';
import { CreateUserDto } from '../createUser.Dto';
import { AuthGuard } from '../../auth.guard';
import { UserPagination } from '../user-pagination';

@UseGuards(AuthGuard)
@Controller('users')
export class UserController {
  constructor(
    protected userQueryRepo: UserQueryRepo,
    protected userService: UsersService,
  ) {}

  @Get()
  async getUsers(@Query() query: UserPagination) {
    // const paginatedQuery: UserPagination = getPaginationValues({
    //   ...query,
    //   sortBy: `accountData.${query.sortBy ?? 'createdAt'}`,
    // });

    return await this.userQueryRepo.getUsers(query);
    // res.status(200).send(getUsers);
  }

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    // if (11 > 10) {
    //   throw new BadRequestException([
    //     { message: 'Bad blogger id', field: 'blogger id' },
    //   ]);
    // }
    const userId = await this.userService.createNewUser(createUserDto);
    if (userId) {
      return await this.userQueryRepo.getUserById(userId);
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
