import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CreateCommentDto } from '../../public/comments/createComment.Dto';

@Injectable()
export class CommentsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

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
      `INSERT INTO public.post_info(
        title, "blogId", "blogName", "blogOwnerId", "commentId")
        VALUES ( $1, $2, $3, $4, $5);`,
      [
        commentData.title,
        commentData.blogId,
        commentData.blogOwnerId,
        commentData.blogOwnerId,
        commentId,
      ],
    );
    await this.dataSource.query(
      `INSERT INTO public.commentator_info(
             "userId", "userLogin", "isBanned", "commentId")
            VALUES ( $1, $2, $3, $4);`,
      [commentData.userId, commentData.login, false, commentId],
    );

    return commentId;
  }

  async updateComment(commentId: string, createCommentDto: CreateCommentDto) {
    const isUpdated = await this.dataSource.query(
      `UPDATE public.comments
            SET  content=$1
            WHERE "id" = $2;`,
      [commentId, createCommentDto.content],
    );

    return isUpdated[1] === 1;
  }

  async getComment(commentId) {
    const comment = await this.dataSource.query(
      `select * from public.comments c
              Left join public.commentator_info ci on 
              c."id" = ci."commentId"
              Left join public.post_info pi on
              c."id" = pi."commentId"
              Where "id"= $1`,
      [commentId],
    );

    return comment[0];
    //return this.CommentModel.findOne({ _id: new ObjectId(commentId) });
  }

  // async getCommentByBlogId(blogId): Promise<CommentDocument | null> {
  //   return this.CommentModel.findOne({ 'postInfo.blogId': blogId });
  // }

  async deleteComment(commentId: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `DELETE FROM public.comments
                            WHERE "id" =$1;`,
      [commentId],
    );

    await this.dataSource.query(
      `DELETE FROM public.commentator_info
                            WHERE "commentId" =$1;`,
      [commentId],
    );

    await this.dataSource.query(
      `DELETE FROM public.post_info
                            WHERE "commentId" =$1;`,
      [commentId],
    );

    // const result = await this.CommentModel.deleteOne({
    //   _id: new ObjectId(commentId),
    // });

    return result[1] === 1;
  }
}
