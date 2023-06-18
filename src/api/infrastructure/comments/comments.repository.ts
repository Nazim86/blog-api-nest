import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentDocument } from '../../entities/comment.entity';
import { Model } from 'mongoose';
import {
  CommentLike,
  CommentLikeDocument,
} from '../../entities/commentLike.entity';
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

  async setBanStatusForComment(userId: string, banStatus: boolean) {
    await this.CommentModel.updateMany(
      { 'commentatorInfo.userId': userId },
      { $set: { 'commentatorInfo.isBanned': banStatus } },
    );
  }

  async getComment(commentId): Promise<CommentDocument | null> {
    return this.CommentModel.findOne({ _id: new ObjectId(commentId) });
  }

  async deleteComment(commentId: string): Promise<boolean> {
    const result = await this.CommentModel.deleteOne({
      _id: new ObjectId(commentId),
    });

    return result.deletedCount === 1;
  }
}
