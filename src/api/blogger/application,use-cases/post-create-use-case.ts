import { BlogRepository } from '../../infrastructure/blogs/blog.repository';
import { CommandHandler } from '@nestjs/cqrs';

import { CreatePostDto } from '../../public/post/createPostDto';
import { PostRepository } from '../../infrastructure/posts/post.repository';
import { ResultCode } from '../../../exception-handler/result-code-enum';
import { Result } from '../../../exception-handler/result-type';
import { Posts } from '../../entities/posts/posts.entity';

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

    return { code: ResultCode.Success, data: post.id };
  }
}
