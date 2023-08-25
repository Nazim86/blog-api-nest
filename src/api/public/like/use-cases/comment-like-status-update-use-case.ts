import { CommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../../../infrastructure/comments/comments.repository';
import { CreateLikeDto } from '../createLikeDto';

import { LikesRepository } from '../../../infrastructure/likes/likes.repository';
import { UsersRepository } from '../../../infrastructure/users/users.repository';
import { CommentLike } from '../../../entities/like/commentLike.entity';

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
    private readonly usersRepository: UsersRepository,
  ) {}
  async execute(command: CommentLikeStatusUpdateCommand): Promise<boolean> {
    const comment = await this.commentsRepository.getComment(command.commentId);

    if (!comment) return false;

    const user = await this.usersRepository.findUserById(command.userId);

    const commentLike = await this.likesRepository.findCommentLike(
      comment.id,
      user.id,
    );

    if (!commentLike) {
      const newCommentLike = new CommentLike();
      newCommentLike.comment = comment;
      newCommentLike.user = user;
      newCommentLike.addedAt = new Date();
      newCommentLike.status = command.createLikeDto.likeStatus;
      await this.likesRepository.saveCommentLike(newCommentLike);
    } else {
      commentLike.status = command.createLikeDto.likeStatus;
      await this.likesRepository.saveCommentLike(commentLike);
    }
    // await this.likesRepository.createCommentLike(
    //   command.commentId,
    //   command.userId,
    //   command.createLikeDto,
    // );
    return true;
  }
}
