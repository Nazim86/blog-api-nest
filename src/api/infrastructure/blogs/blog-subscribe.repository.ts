import { SubscribeBlog } from '../../entities/blogs/subscribeBlog.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from '../../../enums/subscription-enum';

export class BlogSubscribeRepository {
  constructor(
    @InjectRepository(SubscribeBlog)
    private readonly subscribeBlogRepo: Repository<SubscribeBlog>,
  ) {}
  async saveSubscription(subscription: SubscribeBlog) {
    return this.subscribeBlogRepo.save(subscription);
  }

  async findSubscriptionForUser(userId: string, blogId: string) {
    return this.subscribeBlogRepo
      .createQueryBuilder('sb')
      .leftJoinAndSelect('sb.user', 'u')
      .leftJoinAndSelect('sb.blog', 'b')
      .where('u.id = :userId', { userId })
      .andWhere('b.id = :blogId', { blogId })
      .andWhere('sb.status = :status', { status: Subscription.Subscribed })
      .getOne();
  }

  async findSubscriptionForBlog(blogId: string): Promise<SubscribeBlog[]> {
    return this.subscribeBlogRepo
      .createQueryBuilder('sb')
      .leftJoinAndSelect('sb.blog', 'b')
      .where('b.id = :blogId', { blogId })
      .andWhere('sb.status = :status', { status: Subscription.Subscribed })
      .getMany();
  }

  async findSubscriberByTelegramId(
    telegramId: number,
  ): Promise<SubscribeBlog | null> {
    try {
      return this.subscribeBlogRepo
        .createQueryBuilder('sb')
        .where('sb.telegramId = :telegramId', { telegramId })
        .getOne();
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async findSubscriberByTelegramCode(code: string): Promise<SubscribeBlog> {
    try {
      return this.subscribeBlogRepo
        .createQueryBuilder('sb')
        .where('sb.subscriberCode = :code', { code })
        .getOne();
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async findSubscriberByUserId(userId: string): Promise<SubscribeBlog> {
    try {
      return this.subscribeBlogRepo
        .createQueryBuilder('sb')
        .leftJoinAndSelect('sb.user', 'u')
        .where('u.id = :userId', { userId })
        .getOne();
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}
