import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendUserConfirmationEmail(
    confirmationCode: string,
    email: string,
    login: string,
  ) {
    console.log('Mail service with inputs', confirmationCode, email, login);
    const url = `https://somesite.com/confirm-email?code=${confirmationCode}`;

    await this.mailerService.sendMail({
      to: email,
      // from: '"Support Team" <support@example.com>', // override default from
      subject: 'Email confirmation',
      template: './registration-confirmation', // `.hbs` extension is appended automatically
      context: {
        // ✏️ filling curly brackets with content
        login: login,
        url,
      },
    });
  }

  async passwordRecoveryEmail(
    confirmationCode: string,
    email: string,
    login: string,
  ) {
    const url = `https://somesite.com/confirm-email?code=${confirmationCode}`;

    await this.mailerService.sendMail({
      to: email,
      // from: '"Support Team" <support@example.com>', // override default from
      subject: 'Password Recovery',
      template: './password-recovery', // `.hbs` extension is appended automatically
      context: {
        // ✏️ filling curly brackets with content
        login: login,
        url,
      },
    });
  }
}
