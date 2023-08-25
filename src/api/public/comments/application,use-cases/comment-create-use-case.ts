import { CommandHandler } from '@nestjs/cqrs';
import { PostRepository } from '../../../infrastructure/posts/post.repository';
import { UsersRepository } from '../../../infrastructure/users/users.repository';
import { CommentsRepository } from '../../../infrastructure/comments/comments.repository';
import { ResultCode } from '../../../../exception-handler/result-code-enum';
import { BlogRepository } from '../../../infrastructure/blogs/blog.repository';
import { Comments } from '../../../entities/comments/comments.entity';

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

    const blog = await this.blogsRepository.getBlogById(post.blog.id);

    const bannedUser = await this.usersRepository.findBloggerBannedUser(
      command.userId,
      post.blog.id,
    );

    if (bannedUser) {
      return { code: ResultCode.Forbidden };
    }

    const newComment = new Comments();
    newComment.post = post;
    newComment.content = command.createCommentDto.content;
    newComment.createdAt = new Date().toISOString();
    newComment.user = user;

    // const commentId = await this.commentsRepository.createComment({
    //   createCommentDto: command.createCommentDto,
    //   postId: command.postId,
    //   userId: command.userId,
    //   login: user.login,
    //   title: post.title,
    //   blogId: post.blog.id,
    //   blogName: post.blog.name,
    //   blogOwnerId: blog.owner,
    // });

    const comment = await this.commentsRepository.saveComment(newComment);

    return { data: comment.id, code: ResultCode.Success };
  }
}
