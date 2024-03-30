import { BlogRepository } from '../../infrastructure/blogs/blog.repository';
import { CommandHandler } from '@nestjs/cqrs';

import { CreatePostDto } from '../../public/post/createPostDto';
import { PostRepository } from '../../infrastructure/posts/post.repository';
import { ResultCode } from '../../../exception-handler/result-code-enum';
import { Result } from '../../../exception-handler/result-type';
import { Posts } from '../../entities/posts/posts.entity';
import { BlogSubscribeRepository } from '../../infrastructure/blogs/blog-subscribe.repository';
import { SubscribeBlog } from '../../entities/blogs/subscribeBlog.entity';
import { TelegramAdapter } from '../../infrastructure/adapters/telegram.adapter';

export class PostCreateCommand {
  constructor(
    public userId: string,
    public blogId: string,
    public createPostDto: CreatePostDto,
  ) {}
}
@CommandHandler(PostCreateCommand)
export class PostCreateUseCase {
  constructor(
    private readonly blogRepository: BlogRepository,
    private readonly postRepository: PostRepository,
    private readonly blogSubscribeRepo: BlogSubscribeRepository,
    private readonly telegramAdapter: TelegramAdapter,
  ) {}

  async execute(command: PostCreateCommand): Promise<Result<string>> {
    const blog = await this.blogRepository.getBlogById(command.blogId);

    if (!blog) return { code: ResultCode.NotFound };

    if (blog.owner.id !== command.userId) return { code: ResultCode.Forbidden };

    const newPost = new Posts();
    newPost.title = command.createPostDto.title;
    newPost.shortDescription = command.createPostDto.shortDescription;
    newPost.content = command.createPostDto.content;
    newPost.createdAt = new Date().toISOString();
    newPost.blog = blog;

    const post = await this.postRepository.savePost(newPost);
    await this.sendTelegramNotification(blog.id, blog.name);

    return { code: ResultCode.Success, data: post.id };
  }

  private async sendTelegramNotification(blogId: string, blogName: string) {
    const subscribers: SubscribeBlog[] =
      await this.blogSubscribeRepo.findSubscriptionForBlog(blogId);

    if (!subscribers.length) return null;

    const message = `New post published for blog ${blogName}`;

    subscribers.forEach((s) => {
      return this.telegramAdapter.sendMessage(message, s.telegramId);
    });
    return;
  }
}
