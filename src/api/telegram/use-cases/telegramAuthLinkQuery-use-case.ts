import { ICommandHandler, QueryHandler } from '@nestjs/cqrs';
import { BlogSubscribeRepository } from '../../infrastructure/blogs/blog-subscribe.repository';
import { UsersRepository } from '../../infrastructure/users/users.repository';
import { v4 as uuid } from 'uuid';
import { Subscription } from '../../../enums/subscription-enum';
import { SubscribeBlog } from '../../entities/blogs/subscribeBlog.entity';
import process from 'process';

export class TelegramAuthLinkQuery {
  constructor(public userId: string) {}
}

@QueryHandler(TelegramAuthLinkQuery)
export class TelegramAuthLinkUseCase implements ICommandHandler {
  constructor(
    private readonly blogSubscribeRepo: BlogSubscribeRepository,
    private readonly userRepo: UsersRepository,
  ) {}

  async execute({ userId }: TelegramAuthLinkQuery): Promise<any> {
    const user = await this.userRepo.findUserById(userId);

    if (!user) return null;

    const subscriberCode = uuid();

    const subscriber = await this.blogSubscribeRepo.findSubscriberByUserId(
      userId,
    );

    if (!subscriber) {
      const newSubscriber = new SubscribeBlog();
      newSubscriber.user = user;
      newSubscriber.status = Subscription.None;
    }

    subscriber.subscriberCode = subscriberCode;

    await this.blogSubscribeRepo.saveSubscription(subscriber);

    const botName = process.env.BOT_NAME;

    return {
      link: `https://t.me/${botName}?code=${subscriber.subscriberCode}`,
    };
  }
}
// https://t.me/incubatorBlogBot?code=793546771
//793546771
