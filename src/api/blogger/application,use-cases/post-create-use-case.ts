import { BlogRepository } from '../../infrastructure/blogs/blog.repository';
import { CommandHandler } from '@nestjs/cqrs';

import { CreatePostDto } from '../../public/post/createPostDto';
import { PostRepository } from '../../infrastructure/posts/post.repository';
import { ResultCode } from '../../../exception-handler/result-code-enum';
import { Result } from '../../../exception-handler/result-type';

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
  ) {}

  async execute(command: PostCreateCommand): Promise<Result<ResultCode>> {
    console.log('blogId', command.blogId);
    const blog = await this.blogRepository.getBlogById(command.blogId);

    if (!blog) return { code: ResultCode.NotFound };

    if (blog.ownerId !== command.userId) return { code: ResultCode.Forbidden };

    const postId = await this.postRepository.createPost(
      command.createPostDto,
      blog,
    );

    return { code: ResultCode.Success, data: postId };
  }
}
