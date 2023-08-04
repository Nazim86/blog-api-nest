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
             "postId", content, "createdAt", "userId")
            VALUES ( $1, $2, $3,$4) returning id;`,
      [
        commentData.postId,
        commentData.createCommentDto.content,
        new Date().toISOString(),
        commentData.userId,
      ],
    );

    commentId = commentId[0].id;

    return commentId;
  }

  async updateComment(commentId: string, createCommentDto: CreateCommentDto) {
    const isUpdated = await this.dataSource.query(
      `UPDATE public.comments
            SET  "content"=$1
            WHERE "id" = $2;`,
      [createCommentDto.content, commentId],
    );
    return isUpdated[1] === 1;
  }

  async getComment(commentId) {
    const comment = await this.dataSource.query(
      `select c.*, u."login",
               p.title, p."blogId", p."blogName"
                from public.comments c
              Left join public.users u on 
              c."userId" = u."id"
              Left join public.posts p on
              c."postId" = p."id"
              Where c."id"= $1`,
      [commentId],
    );
    return comment[0];
  }

  async deleteComment(commentId: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `DELETE FROM public.comments
                            WHERE "id" =$1;`,
      [commentId],
    );
    console.log(result);
    return result[1] === 1;
  }
}
