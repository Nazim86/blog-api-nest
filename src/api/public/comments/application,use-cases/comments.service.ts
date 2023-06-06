import { Injectable } from '@nestjs/common';
import { CommentsRepository } from '../infrastructure/comments.repository';
import { InjectModel } from '@nestjs/mongoose';
import {
  Comment,
  CommentDocument,
  CommentModelType,
} from '../../../../domains/comment.entity';
import { CreateLikeDto } from '../../like/createLikeDto';
import {
  CommentLike,
  CommentLikeDocument,
  CommentLikeModelType,
} from '../../../../domains/commentLike.entity';
import { LikesRepository } from '../../like/likes.repository';
import { PostRepository } from '../../post/infrastructure/post.repository';
import { UsersRepository } from '../../../superadmin/users/infrastructure/users.repository';
import { ResultCode } from '../../../../exception-handler/result-code-enum';
import { Result } from '../../../../exception-handler/result-type';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
    @InjectModel(CommentLike.name)
    private CommentLikeModel: CommentLikeModelType,
    protected postsRepository: PostRepository,
    protected commentsRepository: CommentsRepository,
    protected likesRepository: LikesRepository,
    protected usersRepository: UsersRepository,
  ) {}

  async updateCommentLikeStatus(
    commentId: string,
    userId: string,
    createLikeDto: CreateLikeDto,
  ): Promise<boolean> {
    const comment: CommentDocument | null =
      await this.commentsRepository.getComment(commentId);

    if (!comment) return false;

    const commentLike: CommentLikeDocument | null =
      await this.likesRepository.findCommentLike(commentId, userId);

    if (!commentLike) {
      const newCommentLike = this.CommentLikeModel.createCommentLike(
        commentId,
        userId,
        createLikeDto,
        this.CommentLikeModel,
      );
      await this.likesRepository.save(newCommentLike);
      return true;
    }

    commentLike.updateCommentLikeStatus(
      //commentLike._id.toString(),
      //userId,
      createLikeDto,
    );
    await this.likesRepository.save(commentLike);
    return true;
  }

  async deleteComment(
    commentId: string,
    userId: string,
  ): Promise<Result<ResultCode>> {
    const comment: CommentDocument = await this.commentsRepository.getComment(
      commentId,
    );

    if (comment && comment.commentatorInfo.userId !== userId) {
      return {
        code: ResultCode.Forbidden,
      };
    }

    const isDeleted: boolean = await this.commentsRepository.deleteComment(
      commentId,
    );

    return { code: isDeleted ? ResultCode.Success : ResultCode.NotFound };
  }
}
