import { BlogRepository } from '../../../blogs/infrastructure/blog.repository';
import { InjectModel } from '@nestjs/mongoose';
import { BlogDocument } from '../../../blogs/domain/blog.entity';
import { CommandHandler } from '@nestjs/cqrs';

import { CreatePostDto } from '../../../post/createPostDto';
import {
  Post,
  PostDocument,
  PostModelType,
} from '../../../post/domain/post.entity';
import { PostRepository } from '../../../post/infrastructure/post.repository';
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
    @InjectModel(Post.name) private PostModel: PostModelType,
  ) {}

  async execute(command: PostCreateCommand): Promise<Result<ResultCode>> {
    const blog: BlogDocument = await this.blogRepository.getBlogById(
      command.createPostDto.blogId,
    );
    if (!blog) return { code: ResultCode.NotFound };

    if (blog.blogOwnerInfo.userId !== command.userId)
      return { code: ResultCode.Forbidden };

    const newPost: PostDocument = this.PostModel.createPost(
      command.createPostDto,
      this.PostModel,
      blog,
    );

    await this.postRepository.save(newPost);

    return { code: ResultCode.Success, data: newPost.id };
  }
}
