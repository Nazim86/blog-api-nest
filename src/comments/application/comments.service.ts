import { Injectable } from '@nestjs/common';
import { CommentsQueryRepo } from '../infrastructure/comments.query.repo';
import { PostsQueryRepo } from '../../post/infrastructure/posts-query-repo';
import { CommentsRepository } from '../infrastructure/comments.repository';
import { CommentsViewType } from '../types/comments-view-type';
import { PostsViewType } from '../../post/types/posts-view-type';
import { CreateCommentDto } from '../createComment.Dto';
import { InjectModel } from '@nestjs/mongoose';
import { CommentDocument, CommentModelType } from '../comment.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
    protected commentsQueryRepo: CommentsQueryRepo,
    protected postQueryRepo: PostsQueryRepo,
    protected commentsRepository: CommentsRepository,
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
    likeStatus: LikeEnum,
  ): Promise<boolean> {
    const getComment: CommentsViewType | null =
      await this.commentsQueryRepo.getComment(commentId, userId);

    if (!getComment) return false;

    return await this.commentsRepository.updateCommentLikeStatus(
      commentId,
      userId,
      likeStatus,
    );
  }

  async deleteComment(commentId: string): Promise<boolean> {
    return await this.commentsRepository.deleteComment(commentId);
  }
}
