import { CommandHandler } from '@nestjs/cqrs';
import { BlogDocument } from '../../../domains/blog.entity';
import { BlogRepository } from '../../public/blogs/infrastructure/blog.repository';
import { ResultCode } from '../../../exception-handler/result-code-enum';
import { Result } from '../../../exception-handler/result-type';
import { PostDocument } from '../../../domains/post.entity';
import { PostRepository } from '../../public/post/infrastructure/post.repository';

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
    const post: PostDocument = await this.postRepository.getPostById(
      command.params.postId,
    );
    if (!post) return { code: ResultCode.NotFound };

    const blog: BlogDocument = await this.blogRepository.getBlogById(
      command.params.blogId,
    );

    if (!blog) {
      return { code: ResultCode.NotFound };
    }

    if (blog.blogOwnerInfo.userId !== command.userId)
      return { code: ResultCode.Forbidden };

    const isPostDeleted = await this.postRepository.deletePostById(post.id);

    return { code: isPostDeleted ? ResultCode.Success : ResultCode.NotFound };
  }
}
