import { Body, Controller, Param, Put } from '@nestjs/common';
import { BanUserDto } from './banUserDto';
import { CommandBus } from '@nestjs/cqrs';
import { BanUserCommand } from './ban-user-user-case';
import { exceptionHandler } from '../../../exception-handler/exception-handler';
import { ResultCode } from '../../../exception-handler/result-code-enum';

@Controller('sa/users')
export class SuperAdminUsersController {
  constructor(private commandBus: CommandBus) {}
  @Put(':userId/ban')
  async banUser(@Param('userId') userId, @Body() banUserDto: BanUserDto) {
    const isUserBanned = await this.commandBus.execute(
      new BanUserCommand(userId, banUserDto),
    );

    if (!isUserBanned || isUserBanned.code !== ResultCode.Success) {
      return exceptionHandler(ResultCode.BadRequest, isUserBanned.data);
    }

    return;
  }
}
