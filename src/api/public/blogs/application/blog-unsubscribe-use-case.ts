import { SubscribeBlog } from '../../../entities/blogs/subscribeBlog.entity';
import { CommandHandler } from '@nestjs/cqrs';
import { BlogRepository } from '../../../infrastructure/blogs/blog.repository';
import { UsersRepository } from '../../../infrastructure/users/users.repository';
import { BlogSubscribeRepository } from '../../../infrastructure/blogs/blog-subscribe.repository';
import { Subscription } from '../../../../enums/subscription-enum';
import { ResultCode } from '../../../../exception-handler/result-code-enum';

export class UnsubscribeBlogCommand {
  constructor(public userId: string, public blogId: string) {}
}
@CommandHandler(UnsubscribeBlogCommand)
export class UnsubscribeBlogUseCase {
  constructor(
    private readonly blogRepository: BlogRepository,
    private readonly usersRepository: UsersRepository,
    private readonly subscribeBlogRepo: BlogSubscribeRepository,
  ) {}

  async execute(command: UnsubscribeBlogCommand) {
    const user = await this.usersRepository.findUserById(command.userId);

    if (!user) return { code: ResultCode.NotFound };

    const blog = await this.blogRepository.getBlogById(command.blogId);

    if (!blog) return { code: ResultCode.NotFound };

    const subscription = await this.subscribeBlogRepo.findSubscription(
      user.id,
      blog.id,
    );

    if (!subscription) return { code: ResultCode.NotFound };

    subscription.status = Subscription.Unsubscribed;

    await this.subscribeBlogRepo.saveSubscription(subscription);

    return true;
  }
}
