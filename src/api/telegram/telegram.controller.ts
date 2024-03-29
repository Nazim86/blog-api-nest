import { Body, Controller, Post } from '@nestjs/common';
import axios from 'axios';
import { TelegramAdapter } from '../infrastructure/adapters/telegram.adapter';

@Controller('integrations/telegram')
export class TelegramController {
  constructor(private readonly telegramAdapter: TelegramAdapter) {}
  @Post('webhook')
  async webhook(@Body() payload: any) {
    console.log(payload);

    this.telegramAdapter.sendMessage(
      payload.message.text,
      payload.message.from.id,
    );

    return { status: 'success' };
  }
}

// 7134786229:AAGCP5oOvAUXr4VsOpgd8rzGZHb14PYXKzE
