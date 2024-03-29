import { SubscribeBlog } from '../../../entities/blogs/subscribeBlog.entity';
import { CommandHandler } from '@nestjs/cqrs';
import { BlogRepository } from '../../../infrastructure/blogs/blog.repository';
import { UsersRepository } from '../../../infrastructure/users/users.repository';
import { Subscription } from '../../../../enums/subscription-enum';
import { BlogSubscribeRepository } from '../../../infrastructure/blogs/blog-subscribe.repository';
import { ResultCode } from '../../../../exception-handler/result-code-enum';

export class SubscribeBlogCommand {
  constructor(public userId: string, public blogId: string) {}
}
@CommandHandler(SubscribeBlogCommand)
export class SubscribeBlogUseCase {
  constructor(
    private readonly blogRepository: BlogRepository,
    private readonly usersRepository: UsersRepository,
    private readonly subscribeBlogRepo: BlogSubscribeRepository,
  ) {}

  async execute(command: SubscribeBlogCommand) {
    const user = await this.usersRepository.findUserById(command.userId);

    if (!user) return { code: ResultCode.NotFound };

    const blog = await this.blogRepository.getBlogById(command.blogId);

    if (!blog) return { code: ResultCode.NotFound };

    const subscription = new SubscribeBlog();
    subscription.id = user.id;
    subscription.status = Subscription.Subscribed;
    subscription.blog = blog;
    subscription.user = user;

    const newSubscription = await this.subscribeBlogRepo.saveSubscription(
      subscription,
    );

    return newSubscription.id;
  }
}
