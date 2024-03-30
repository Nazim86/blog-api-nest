import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogSubscribeRepository } from '../../infrastructure/blogs/blog-subscribe.repository';

export class TelegramAddNotificationCommand {
  constructor(public telegramId: number, public telegramText: string) {}
}

@CommandHandler(TelegramAddNotificationCommand)
export class TelegramAddNotificationUseCase implements ICommandHandler {
  constructor(private readonly blogSubscribeRepo: BlogSubscribeRepository) {}

  async execute({ telegramId, telegramText }: TelegramAddNotificationCommand) {
    const isTelegramIdRegistered =
      await this.blogSubscribeRepo.findSubscriberByTelegramId(telegramId);

    if (isTelegramIdRegistered) return null;

    const subscriberCode = telegramText.split('=')[1];

    if (!subscriberCode) return null;

    const subscriber =
      await this.blogSubscribeRepo.findSubscriberByTelegramCode(subscriberCode);

    subscriber.telegramId = telegramId;
    await this.blogSubscribeRepo.saveSubscription(subscriber);
  }
}
