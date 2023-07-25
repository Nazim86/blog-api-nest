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
import { CommentsQueryRepo } from '../../../infrastructure/comments/comments.query.repo';
import { JwtService } from '../../../../jwt/jwt.service';
import { CommentsViewType } from '../../../infrastructure/comments/types/comments-view-type';
import { settings } from '../../../../settings';
import { AccessTokenGuard } from '../../auth/guards/access-token.guard';
import { CreateLikeDto } from '../../like/createLikeDto';
import { CreateCommentDto } from '../createComment.Dto';
import { Result } from '../../../../exception-handler/result-type';
import { ResultCode } from '../../../../exception-handler/result-code-enum';
import { exceptionHandler } from '../../../../exception-handler/exception-handler';
import { CommandBus } from '@nestjs/cqrs';
import { CommentLikeStatusUpdateCommand } from '../../like/use-cases/comment-like-status-update-use-case';
import { CommentDeleteCommand } from '../application,use-cases/comment-delete-use-case';
import { UserId } from '../../../../decorators/UserId';
import { CommentUpdateCommand } from '../application,use-cases/comment-update-use-case';

@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsQueryRepo: CommentsQueryRepo,
    private readonly jwtService: JwtService,
    private commandBus: CommandBus,
  ) {}

  @UseGuards(AccessTokenGuard)
  @Put(':id')
  @HttpCode(204)
  async updateCommentByCommentId(
    @Param('id') commentId: string,
    @Body() createCommentDto: CreateCommentDto,
    @UserId() userId: string,
  ) {
    const isUpdated: Result<ResultCode> = await this.commandBus.execute(
      new CommentUpdateCommand(commentId, createCommentDto, userId),
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
    const isDeleted: Result<ResultCode> = await this.commandBus.execute(
      new CommentDeleteCommand(commentId, req.user.userId),
    );

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
    @UserId() userId: string,
    @Param('id') commentId: string,
    @Body() createLikeDto: CreateLikeDto,
  ) {
    console.log('userId and commentId in controller', userId, commentId);
    const updateComment: boolean = await this.commandBus.execute(
      new CommentLikeStatusUpdateCommand(commentId, userId, createLikeDto),
    );

    if (!updateComment) {
      return exceptionHandler(ResultCode.NotFound);
    }
    return;
  }
}
