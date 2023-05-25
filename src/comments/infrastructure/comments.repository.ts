import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentDocument } from '../domain/comment.entity';
import { Model } from 'mongoose';
import {
  CommentLike,
  CommentLikeDocument,
} from '../../like/commentLike.entity';
import { LikeEnum } from '../../like/like.enum';
import { ObjectId } from 'mongodb';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: Model<CommentDocument>,
    @InjectModel(CommentLike.name)
    private CommentLikeModel: Model<CommentLikeDocument>,
  ) {}
  async save(newComment: CommentDocument): Promise<CommentDocument> {
    return newComment.save();
  }

  async updateComment(commentId: string, content: string): Promise<boolean> {
    const result = await this.CommentModel.updateOne(
      { _id: new ObjectId(commentId) },
      { $set: { content: content } },
    );

    return result.matchedCount === 1;
  }

  async getComment(commentId, userId): Promise<CommentDocument | null> {
    return this.CommentModel.findOne({
      commentId,
      'commentatorInfo.userId': userId,
    });
  }

  async updateCommentLikeStatus(
    commentId: string,
    userId: string,
    likeStatus: LikeEnum,
  ): Promise<boolean> {
    const result = await this.CommentLikeModel.updateOne(
      { commentId, userId },
      { $set: { addedAt: new Date().toISOString(), status: likeStatus } },
      { upsert: true },
    );

    return result.upsertedCount === 1 || result.modifiedCount === 1;
  }

  async deleteComment(commentId: string): Promise<boolean> {
    const result = await this.CommentModel.deleteOne({
      _id: new ObjectId(commentId),
    });

    return result.deletedCount === 1;
  }
}
