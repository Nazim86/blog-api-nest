import { CommandHandler } from '@nestjs/cqrs';
import { BlogRepository } from '../../infrastructure/blogs/blog.repository';
import { ResultCode } from '../../../exception-handler/result-code-enum';
import { Result } from '../../../exception-handler/result-type';
import { PostRepository } from '../../infrastructure/posts/post.repository';

export class PostDeleteCommand {
  constructor(public userId: string, public params) {}
}

@CommandHandler(PostDeleteCommand)
export class PostDeleteUseCase {
  constructor(
    private readonly blogRepository: BlogRepository,
    private readonly postRepository: PostRepository,
  ) {}

  async execute(command: PostDeleteCommand): Promise<Result<ResultCode>> {
    const post = await this.postRepository.getPostById(command.params.postId);
    if (!post) return { code: ResultCode.NotFound };

    const blog = await this.blogRepository.getBlogById(command.params.blogId);

    if (!blog) {
      return { code: ResultCode.NotFound };
    }

    if (blog.owner.id !== command.userId) return { code: ResultCode.Forbidden };

    const isPostDeleted = await this.postRepository.deletePostById(post.id);

    return { code: isPostDeleted ? ResultCode.Success : ResultCode.NotFound };
  }
}
