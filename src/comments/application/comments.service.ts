import { Injectable } from '@nestjs/common';
import { CommentsRepository } from '../infrastructure/comments.repository';
import { CreateCommentDto } from '../createComment.Dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  Comment,
  CommentDocument,
  CommentModelType,
} from '../domain/comment.entity';
import { CreateLikeDto } from '../../like/createLikeDto';
import {
  CommentLike,
  CommentLikeDocument,
  CommentLikeModelType,
} from '../../like/commentLike.entity';
import { LikesRepository } from '../../like/likes.repository';
import { PostRepository } from '../../post/infrastructure/post.repository';
import { PostDocument } from '../../post/domain/post.entity';
import { UsersRepository } from '../../api/superadmin/users/infrastructure/users.repository';
import { UserDocument } from '../../api/superadmin/users/domain/user.entity';
import { ResultCode } from '../../exception-handler/result-code-enum';
import { Result } from '../../exception-handler/result-type';

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

  async createPostComment(
    createCommentDto: CreateCommentDto,
    postId: string,
    userId: string,
  ): Promise<string | null> {
    const postById: PostDocument | boolean =
      await this.postsRepository.getPostById(postId);

    if (!postById || typeof postById === 'boolean') return null;

    const user: UserDocument | null = await this.usersRepository.findUserById(
      userId,
    );

    if (!user) return null;

    const newComment: CommentDocument = this.CommentModel.createComment(
      createCommentDto,
      postId,
      userId,
      user.accountData.login,
      this.CommentModel,
    );

    await this.commentsRepository.save(newComment);
    return newComment.id;
  }

  async updateComment(
    commentId: string,
    createCommentDto: CreateCommentDto,
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

    const isUpdated: boolean = await this.commentsRepository.updateComment(
      commentId,
      createCommentDto.content,
    );

    return {
      code: isUpdated ? ResultCode.Success : ResultCode.NotFound,
    };
  }

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
