import { CommandHandler } from '@nestjs/cqrs';
import { CreateCommentDto } from '../createComment.Dto';
import { PostRepository } from '../../../infrastructure/posts/post.repository';
import { UsersRepository } from '../../../infrastructure/users/users.repository';
import { CommentsRepository } from '../../../infrastructure/comments/comments.repository';
import { Result } from '../../../../exception-handler/result-type';
import { ResultCode } from '../../../../exception-handler/result-code-enum';

export class CommentUpdateCommand {
  constructor(
    public commentId: string,
    public createCommentDto: CreateCommentDto,
    public userId: string,
  ) {}
}

@CommandHandler(CommentUpdateCommand)
export class CommentUpdateUseCase {
  constructor(
    private readonly postsRepository: PostRepository,
    private readonly usersRepository: UsersRepository,
    private readonly commentsRepository: CommentsRepository,
  ) {}
  async execute(command: CommentUpdateCommand): Promise<Result<ResultCode>> {
    const comment = await this.commentsRepository.getComment(command.commentId);

    if (!comment) return { code: ResultCode.NotFound };

    if (comment && comment.user.id !== command.userId) {
      return {
        code: ResultCode.Forbidden,
      };
    }

    comment.content = command.createCommentDto.content;

    await this.commentsRepository.saveComment(comment);

    return {
      code: comment ? ResultCode.Success : ResultCode.NotFound,
    };
  }
}
