import { SubscribeBlog } from '../../entities/blogs/subscribeBlog.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

export class BlogSubscribeRepository {
  constructor(
    @InjectRepository(SubscribeBlog)
    private readonly subscribeBlogRepo: Repository<SubscribeBlog>,
  ) {}
  async saveSubscription(subscription: SubscribeBlog) {
    return this.subscribeBlogRepo.save(subscription);
  }

  async findSubscription(userId: string, blogId: string) {
    return this.subscribeBlogRepo
      .createQueryBuilder('sb')
      .leftJoinAndSelect('sb.user', 'u')
      .leftJoinAndSelect('sb.blog', 'b')
      .where('u.id = :userId', { userId })
      .andWhere('b.id = :blogId', { blogId })
      .getOne();
  }
}
