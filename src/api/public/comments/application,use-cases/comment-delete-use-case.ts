import { Result } from '../../../../exception-handler/result-type';
import { ResultCode } from '../../../../exception-handler/result-code-enum';
import { CommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../../infrastructure/comments/comments.repository';

export class CommentDeleteCommand {
  constructor(public commentId: string, public userId: string) {}
}
@CommandHandler(CommentDeleteCommand)
export class CommentDeleteUseCase {
  constructor(private readonly commentsRepository: CommentsRepository) {}

  async execute(command: CommentDeleteCommand): Promise<Result<ResultCode>> {
    const comment = await this.commentsRepository.getComment(command.commentId);

    if (comment && comment.user.id !== command.userId) {
      return {
        code: ResultCode.Forbidden,
      };
    }

    const isDeleted: boolean = await this.commentsRepository.deleteComment(
      command.commentId,
    );

    return { code: isDeleted ? ResultCode.Success : ResultCode.NotFound };
  }
}
