import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { QueryPaginationType } from '../../../../types/query-pagination-type';
import { PostsQueryRepo } from '../infrastructure/posts-query-repo';
import { PostService } from '../application/posts.service';
import { PostsViewType } from '../types/posts-view-type';
import { CommentsViewType } from '../../comments/types/comments-view-type';
import { CommentsQueryRepo } from '../../comments/infrastructure/comments.query.repo';
import { Pagination, PaginationType } from '../../../../common/pagination';
import { CommentService } from '../../comments/application/comments.service';
import { CreateCommentDto } from '../../comments/createComment.Dto';
import { ResultCode } from '../../../../exception-handler/result-code-enum';
import { exceptionHandler } from '../../../../exception-handler/exception-handler';
import { BasicAuthGuard } from '../../auth/guards/basic-auth.guard';
import { AccessTokenGuard } from '../../auth/guards/access-token.guard';
import { settings } from '../../../../settings';
import { JwtService } from '../../../../jwt/jwt.service';
import { CreateLikeDto } from '../../like/createLikeDto';
import { CommandBus } from '@nestjs/cqrs';
import { PostLikeUpdateCommand } from '../../like/use-cases/like-update-use-case';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postQueryRepo: PostsQueryRepo,
    private readonly commentsQueryRepo: CommentsQueryRepo,
    private readonly postService: PostService,
    private readonly commentService: CommentService,
    private readonly jwtService: JwtService,
    private commandBus: CommandBus,
  ) {}

  @Get()
  @HttpCode(200)
  async getPosts(@Query() query: Pagination<PaginationType>, @Request() req) {
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

    const getPost: QueryPaginationType<PostsViewType[]> =
      await this.postQueryRepo.getPosts(query, userId);
    return getPost;
  }

  @Get(':id')
  async getPostById(@Param('id') postId: string, @Request() req) {
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

    const getPost: PostsViewType | boolean =
      await this.postQueryRepo.getPostById(postId, userId);

    if (!getPost) {
      return exceptionHandler(ResultCode.NotFound);
    }
    return getPost;
  }

  @Get(':id/comments')
  async getCommentByPostId(
    @Param('id') postId: string,
    @Query() query: Pagination<PaginationType>,
  ) {
    const getCommentsForPost: QueryPaginationType<CommentsViewType[]> | null =
      await this.commentsQueryRepo.getCommentsForPost(postId, query);

    if (!getCommentsForPost) {
      return exceptionHandler(ResultCode.NotFound);
    }
    return getCommentsForPost;
  }

  @UseGuards(AccessTokenGuard) // should be logged user with refreshToken
  @Post(':id/comments')
  async createCommentByPostId(
    @Request() req,
    @Param('id') postId: string,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    const userId = req.user.userId;
    const commentId: string | null =
      await this.commentService.createPostComment(
        createCommentDto,
        postId,
        userId,
      );

    if (!commentId) {
      return exceptionHandler(ResultCode.NotFound);
    }
    return await this.commentsQueryRepo.getComment(commentId);
  }

  @UseGuards(AccessTokenGuard)
  @Put(':id/like-status')
  @HttpCode(204)
  async updatePostLikeStatus(
    @Request() req,
    @Param('id') postId: string,
    @Body() updateLikeDto: CreateLikeDto,
  ) {
    const userId = req.user.userId;

    const isUpdated: boolean = await this.commandBus.execute(
      new PostLikeUpdateCommand(postId, userId, updateLikeDto),
    );

    if (!isUpdated) {
      return exceptionHandler(ResultCode.NotFound);
    }
    return;
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(204)
  async deletePost(@Param() postId: string) {
    const isDeleted: boolean = await this.postService.deletePostById(postId);

    if (!isDeleted) {
      return exceptionHandler(ResultCode.NotFound);
    }
    return;
  }
}
