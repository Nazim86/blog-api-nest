import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { TelegramAdapter } from '../infrastructure/adapters/telegram.adapter';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { TelegramAddNotificationCommand } from './use-cases/telegramAddNotification-use-case';
import { AccessTokenGuard } from '../public/auth/guards/access-token.guard';
import { UserId } from '../../decorators/UserId';
import { exceptionHandler } from '../../exception-handler/exception-handler';
import { ResultCode } from '../../exception-handler/result-code-enum';
import { TelegramAuthLinkQuery } from './use-cases/telegramAuthLinkQuery-use-case';

@Controller('integrations/telegram')
export class TelegramController {
  constructor(
    private readonly telegramAdapter: TelegramAdapter,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}
  @Post('webhook')
  async webhook(@Body() payload: any) {
    if (!payload.message) {
      return;
    }
    console.log(payload);
    const text = payload.message.text;
    const telegramId = payload.message.from.id;

    if (text.includes('/start')) {
      await this.commandBus.execute(
        new TelegramAddNotificationCommand(telegramId, text),
      );
    }

    return;
  }

  @UseGuards(AccessTokenGuard)
  @Get('auth-bot-link')
  async getAuthBotLink(@UserId() userId: string) {
    const result = await this.queryBus.execute(
      new TelegramAuthLinkQuery(userId),
    );

    if (!result) {
      return exceptionHandler(ResultCode.NotFound);
    }

    return result;
  }
}
