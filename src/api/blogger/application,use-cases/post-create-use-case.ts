import { BlogRepository } from '../../infrastructure/blogs/blog.repository';
import { InjectModel } from '@nestjs/mongoose';
import { CommandHandler } from '@nestjs/cqrs';

import { CreatePostDto } from '../../public/post/createPostDto';
import { Post, PostModelType } from '../../entities/post.entity';
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
    @InjectModel(Post.name) private PostModel: PostModelType,
  ) {}

  async execute(command: PostCreateCommand): Promise<Result<ResultCode>> {
    const blog = await this.blogRepository.getBlogById(command.blogId);

    if (!blog) return { code: ResultCode.NotFound };

    if (blog.userId !== command.userId) return { code: ResultCode.Forbidden };

    const newPost = await this.postRepository.createPost(
      command.createPostDto,
      blog,
    );

    // const newPost: PostDocument = this.PostModel.createPost(
    //   command.createPostDto,
    //   this.PostModel,
    //   blog,
    // );

    //await this.postRepository.save(newPost);

    return { code: ResultCode.Success, data: newPost.id };
  }
}
