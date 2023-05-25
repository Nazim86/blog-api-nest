import { Injectable } from '@nestjs/common';
import { PostsQueryRepo } from '../../post/infrastructure/posts-query-repo';
import { CommentsRepository } from '../infrastructure/comments.repository';
import { PostsViewType } from '../../post/types/posts-view-type';
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

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
    @InjectModel(CommentLike.name)
    private CommentLikeModel: CommentLikeModelType,
    protected postQueryRepo: PostsQueryRepo,
    protected commentsRepository: CommentsRepository,
    protected likesRepository: LikesRepository,
  ) {}

  async createPostComment(
    createCommentDto: CreateCommentDto,
    postId: string,
    userId: string,
    userLogin: string,
  ): Promise<string | null> {
    const postById: PostsViewType | boolean =
      await this.postQueryRepo.getPostById(postId);

    if (!postById || typeof postById === 'boolean') return null;

    const newComment: CommentDocument = this.CommentModel.createComment(
      createCommentDto,
      postId,
      userId,
      userLogin,
      this.CommentModel,
    );

    await this.commentsRepository.save(newComment);
    return newComment.id;
  }

  async updateComment(commentId: string, content: string): Promise<boolean> {
    return await this.commentsRepository.updateComment(commentId, content);
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
