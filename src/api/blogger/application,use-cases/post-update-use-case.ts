import { BlogRepository } from '../../infrastructure/blogs/blog.repository';
import { CommandHandler } from '@nestjs/cqrs';
import { PostRepository } from '../../infrastructure/posts/post.repository';
import { CreatePostDto } from '../../public/post/createPostDto';
import { ResultCode } from '../../../exception-handler/result-code-enum';
import { Result } from '../../../exception-handler/result-type';

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
    const blog = await this.blogsRepository.getBlogById(command.params.blogId);

    if (!blog) return { code: ResultCode.NotFound };

    if (blog.owner.id !== command.userId) return { code: ResultCode.Forbidden };

    const post = await this.postsRepository.getPostById(command.params.postId);

    if (!post) return { code: ResultCode.NotFound };

    post.title = command.updatePostDto.title;
    post.shortDescription = command.updatePostDto.shortDescription;
    post.content = command.updatePostDto.content;

    const isUpdated = await this.postsRepository.savePost(post);
    // const isUpdated = await this.postsRepository.updatePost(
    //   command.updatePostDto,
    //   post.id,
    // );

    return { code: isUpdated ? ResultCode.Success : ResultCode.NotFound };
  }
}
