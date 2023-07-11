import { CommandHandler } from '@nestjs/cqrs';
import { CommentDocument } from '../../../entities/comment.entity';
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
    const comment: CommentDocument | null =
      await this.commentsRepository.getComment(command.commentId);

    if (!comment) return false;

    const commentLike = await this.likesRepository.createCommentLike(
      command.commentId,
      command.userId,
      command.createLikeDto,
    );

    // const commentLike: CommentLikeDocument | null =
    //   await this.likesRepository.findCommentLike(
    //     command.commentId,
    //     command.userId,
    //   );
    //
    // if (!commentLike) {
    //   const newCommentLike = this.CommentLikeModel.createCommentLike(
    //     command.commentId,
    //     command.userId,
    //     command.createLikeDto,
    //     this.CommentLikeModel,
    //   );
    //   await this.likesRepository.save(newCommentLike);
    //   return true;
    // }
    //
    // commentLike.updateCommentLikeStatus(
    //   //commentLike._id.toString(),
    //   //userId,
    //   command.createLikeDto,
    // );
    // await this.likesRepository.save(commentLike);

    return true;
  }
}
