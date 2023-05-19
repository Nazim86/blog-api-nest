import { Injectable } from '@nestjs/common';
import { emailMessageType } from '../../types/email-message-type';

@Injectable()
export class EmailManager {
  constructor(protected emailAdapter: EmailAdapter) {}

  async sendConfirmationEmail(
    confirmationCode: string,
    email: string,
    message: emailMessageType,
  ) {
    await this.emailAdapter.sendConfirmationEmail(
      confirmationCode,
      email,
      message,
    );
  }
}
