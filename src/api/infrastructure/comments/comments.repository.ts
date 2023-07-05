import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentDocument } from '../../entities/comment.entity';
import { Model } from 'mongoose';
import {
  CommentLike,
  CommentLikeDocument,
} from '../../entities/commentLike.entity';
import { ObjectId } from 'mongodb';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectModel(Comment.name) private CommentModel: Model<CommentDocument>,
    @InjectModel(CommentLike.name)
    private CommentLikeModel: Model<CommentLikeDocument>,
  ) {}

  async createComment(commentData) {
    let commentId = await this.dataSource.query(
      `
            INSERT INTO public.comments(
             "postId", content, "createdAt")
            VALUES ( $1, $2, $3) returning id;`,
      [
        commentData.postId,
        commentData.createCommentDto.content,
        new Date().toISOString(),
      ],
    );

    commentId = commentId[0].id;

    await this.dataSource.query(
      `INSERT INTO public.commentator_info(
                     "userId", "userLogin", "isBanned", "commentId") 
                    VALUES ($1, $2, $3, $4);`,
      [commentData.userId, commentData.login, false, commentId],
    );

    await this.dataSource.query(
      `INSERT INTO public.post_info(
             title, "blogId", "blogName", "blogOwnerId", "commentId")
            VALUES ( $1, $2, $3, $4, $5);`,
      [
        commentData.title,
        commentData.blogId,
        commentData.blogOwnerId,
        commentId,
      ],
    );

    return commentId;
  }

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

  // async getCommentByBlogId(blogId): Promise<CommentDocument | null> {
  //   return this.CommentModel.findOne({ 'postInfo.blogId': blogId });
  // }

  async deleteComment(commentId: string): Promise<boolean> {
    const result = await this.CommentModel.deleteOne({
      _id: new ObjectId(commentId),
    });

    return result.deletedCount === 1;
  }
}
