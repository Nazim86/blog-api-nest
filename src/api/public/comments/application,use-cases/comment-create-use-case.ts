import { CommandHandler } from '@nestjs/cqrs';
import { PostRepository } from '../../../infrastructure/posts/post.repository';
import { UsersRepository } from '../../../infrastructure/users/users.repository';
import { CommentsRepository } from '../../../infrastructure/comments/comments.repository';
import { ResultCode } from '../../../../exception-handler/result-code-enum';
import { BlogRepository } from '../../../infrastructure/blogs/blog.repository';

export class CommentCreateCommand {
  constructor(public createCommentDto, public postId, public userId) {}
}

@CommandHandler(CommentCreateCommand)
export class CommentCreateUseCase {
  constructor(
    private readonly postsRepository: PostRepository,
    private readonly usersRepository: UsersRepository,
    private readonly commentsRepository: CommentsRepository,
    private readonly blogsRepository: BlogRepository,
  ) {}
  async execute(command: CommentCreateCommand) {
    const post = await this.postsRepository.getPostById(command.postId);
    if (!post || typeof post === 'boolean')
      return { code: ResultCode.NotFound };

    const user = await this.usersRepository.findUserById(command.userId);

    if (!user) return { code: ResultCode.NotFound };

    const blog = await this.blogsRepository.getBlogById(post.blogId);

    const bannedUser = await this.usersRepository.findBloggerBannedUser(
      command.userId,
      post.blogId,
    );

    if (bannedUser) {
      return { code: ResultCode.Forbidden };
    }

    const commentId = await this.commentsRepository.createComment({
      createCommentDto: command.createCommentDto,
      postId: command.postId,
      userId: command.userId,
      login: user.login,
      title: post.title,
      blogId: post.blogId,
      blogName: post.blogName,
      blogOwnerId: blog.owner,
    });

    return { data: commentId, code: ResultCode.Success };
  }
}
