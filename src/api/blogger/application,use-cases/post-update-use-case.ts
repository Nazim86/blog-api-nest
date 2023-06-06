import { BlogRepository } from '../../public/blogs/infrastructure/blog.repository';
import { BlogDocument } from '../../public/blogs/domain/blog.entity';
import { CommandHandler } from '@nestjs/cqrs';
import { PostRepository } from '../../public/post/infrastructure/post.repository';
import { CreatePostDto } from '../../public/post/createPostDto';
import { ResultCode } from '../../../exception-handler/result-code-enum';
import { Result } from '../../../exception-handler/result-type';
import { PostDocument } from '../../../domains/post.entity';

export class PostUpdateCommand {
  constructor(
    public userId: string,
    public params,
    public updatePostDto: CreatePostDto,
  ) {}
}

@CommandHandler(PostUpdateCommand)
export class PostUpdateUseCase {
  constructor(
    private readonly postsRepository: PostRepository,
    private readonly blogsRepository: BlogRepository,
  ) {}

  async execute(command: PostUpdateCommand): Promise<Result<ResultCode>> {
    const blog: BlogDocument = await this.blogsRepository.getBlogById(
      command.params.blogId,
    );

    if (!blog) return { code: ResultCode.NotFound };

    if (blog.blogOwnerInfo.userId !== command.userId)
      return { code: ResultCode.Forbidden };

    const post: PostDocument = await this.postsRepository.getPostById(
      command.params.postId,
    );

    if (!post) return { code: ResultCode.NotFound };

    post.updatePost(command.updatePostDto);

    await this.postsRepository.save(post);

    return { code: ResultCode.Success };
  }
}
