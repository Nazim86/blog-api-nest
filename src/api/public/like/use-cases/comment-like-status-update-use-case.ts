import { CommandHandler } from '@nestjs/cqrs';
import { CommentDocument } from '../../../../domains/comment.entity';
import { InjectModel } from '@nestjs/mongoose';
import { CommentsRepository } from '../../comments/infrastructure/comments.repository';
import { CreateLikeDto } from '../createLikeDto';
import {
  CommentLike,
  CommentLikeDocument,
  CommentLikeModelType,
} from '../../../../domains/commentLike.entity';
import { LikesRepository } from '../likes.repository';

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
    @InjectModel(CommentLike.name)
    private CommentLikeModel: CommentLikeModelType,
  ) {}
  async execute(command: CommentLikeStatusUpdateCommand): Promise<boolean> {
    const comment: CommentDocument | null =
      await this.commentsRepository.getComment(command.commentId);

    if (!comment) return false;

    const commentLike: CommentLikeDocument | null =
      await this.likesRepository.findCommentLike(
        command.commentId,
        command.userId,
      );

    if (!commentLike) {
      const newCommentLike = this.CommentLikeModel.createCommentLike(
        command.commentId,
        command.userId,
        command.createLikeDto,
        this.CommentLikeModel,
      );
      await this.likesRepository.save(newCommentLike);
      return true;
    }

    commentLike.updateCommentLikeStatus(
      //commentLike._id.toString(),
      //userId,
      command.createLikeDto,
    );
    await this.likesRepository.save(commentLike);
    return true;
  }
}
