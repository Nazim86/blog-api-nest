import { CommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../../infrastructure/comments/comments.repository';
import { CreateLikeDto } from '../createLikeDto';

import { LikesRepository } from '../../../infrastructure/likes/likes.repository';

export class CommentLikeStatusUpdateCommand {
  constructor(
    public commentId: string,
    public userId: string,
    public createLikeDto: CreateLikeDto,
  ) {}
}

@CommandHandler(CommentLikeStatusUpdateCommand)
export class CommentLikeStatusUpdateUseCase {
  constructor(
    private readonly likesRepository: LikesRepository,
    private readonly commentsRepository: CommentsRepository,
  ) {}
  async execute(command: CommentLikeStatusUpdateCommand): Promise<boolean> {
    const comment = await this.commentsRepository.getComment(command.commentId);

    if (!comment) return false;

    await this.likesRepository.createCommentLike(
      command.commentId,
      command.userId,
      command.createLikeDto,
    );
    return true;
  }
}
