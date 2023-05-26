import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  Param,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CommentService } from '../application/comments.service';
import { CommentsQueryRepo } from '../infrastructure/comments.query.repo';
import { JwtService } from '../../jwt/jwt.service';
import { CommentsViewType } from '../types/comments-view-type';
import { settings } from '../../settings';
import { AccessTokenGuard } from '../../auth/guards/access-token.guard';
import { CreateLikeDto } from '../../like/createLikeDto';
import { CreateCommentDto } from '../createComment.Dto';

@Controller('comments')
export class CommentsController {
  constructor(
    protected commentService: CommentService,
    protected commentsQueryRepo: CommentsQueryRepo,
    protected jwtService: JwtService,
  ) {}

  @UseGuards(AccessTokenGuard)
  @Put(':id')
  @HttpCode(204)
  async updateCommentByCommentId(
    @Param('id') commentId: string,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    const updateComment: boolean = await this.commentService.updateComment(
      commentId,
      createCommentDto,
    );

    if (!updateComment) {
      throw new HttpException('Not Found', 404);
    }
    return;
  }

  @UseGuards(AccessTokenGuard)
  @Delete(':id')
  @HttpCode(204)
  async deleteCommentByCommentId(@Param('id') commentId: string) {
    const deleteComment: boolean = await this.commentService.deleteComment(
      commentId,
    );

    if (!deleteComment) {
      throw new HttpException('Not Found', 404);
    }
    return;
  }

  @Get(':id')
  async getCommentByCommentId(@Param('id') commentId: string, @Request() req) {
    const accessToken: string | undefined =
      req.headers.authorization?.split(' ')[1];

    let userId = undefined;

    if (accessToken) {
      const tokenData = await this.jwtService.getTokenMetaData(
        accessToken,
        settings.ACCESS_TOKEN_SECRET,
      );
      if (tokenData) {
        userId = tokenData.userId;
      }
    }

    const getComment: CommentsViewType | null =
      await this.commentsQueryRepo.getComment(commentId, userId);

    if (!getComment) {
      throw new HttpException('Not Found', 404);
    }
    return getComment;
    // res.status(200).send(getComment);
  }

  @UseGuards(AccessTokenGuard)
  @Put(':id/like-status')
  @HttpCode(204)
  async updateCommentLikeStatus(
    @Param('id') commentId: string,
    @Body() createLikeDto: CreateLikeDto,
    @Request() req,
  ) {
    const userId = req.user.userId;
    // const userId = undefined; // temprorary solution till where to get userID

    const updateComment: boolean =
      await this.commentService.updateCommentLikeStatus(
        commentId,
        userId,
        createLikeDto,
      );

    if (!updateComment) {
      throw new HttpException('Not Found', 404);
    }
    return;
    // res.sendStatus(204);
  }
}
