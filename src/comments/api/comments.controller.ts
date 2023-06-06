import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
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
import { AccessTokenGuard } from '../../api/public/auth/guards/access-token.guard';
import { CreateLikeDto } from '../../like/createLikeDto';
import { CreateCommentDto } from '../createComment.Dto';
import { Result } from '../../exception-handler/result-type';
import { ResultCode } from '../../exception-handler/result-code-enum';
import { exceptionHandler } from '../../exception-handler/exception-handler';

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
    @Request() req,
  ) {
    const isUpdated: Result<ResultCode> =
      await this.commentService.updateComment(
        commentId,
        createCommentDto,
        req.user.userId,
      );

    if (isUpdated.code !== ResultCode.Success) {
      return exceptionHandler(isUpdated.code);
    }
    return;
  }

  @UseGuards(AccessTokenGuard)
  @Delete(':id')
  @HttpCode(204)
  async deleteCommentByCommentId(
    @Param('id') commentId: string,
    @Request() req,
  ) {
    const isDeleted: Result<ResultCode> =
      await this.commentService.deleteComment(commentId, req.user.userId);

    if (isDeleted.code !== ResultCode.Success) {
      return exceptionHandler(isDeleted.code);
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
      return exceptionHandler(ResultCode.NotFound);
    }
    return getComment;
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

    const updateComment: boolean =
      await this.commentService.updateCommentLikeStatus(
        commentId,
        userId,
        createLikeDto,
      );

    if (!updateComment) {
      return exceptionHandler(ResultCode.NotFound);
    }
    return;
  }
}
