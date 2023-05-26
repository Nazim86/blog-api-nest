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
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { UserDocument } from '../../users/domain/user.entity';

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

    const user: UserDocument = await this.usersRepository.findUserById(userId);

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
  ): Promise<boolean> {
    return await this.commentsRepository.updateComment(
      commentId,
      createCommentDto.content,
    );
  }

  async updateCommentLikeStatus(
    commentId: string,
    userId: string,
    createLikeDto: CreateLikeDto,
  ): Promise<boolean> {
    const comment: CommentDocument | null =
      await this.commentsRepository.getComment(commentId, userId);

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
    commentLike.updateCommentLikeStatus(commentId, userId, createLikeDto);
    await this.likesRepository.save(comment);
    return true;
  }

  async deleteComment(commentId: string): Promise<boolean> {
    return await this.commentsRepository.deleteComment(commentId);
  }
}
