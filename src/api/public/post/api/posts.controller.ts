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
  Request,
  UseGuards,
} from '@nestjs/common';
import { QueryPaginationType } from '../../../../types/query-pagination-type';
import { PostsQueryRepo } from '../../../infrastructure/posts/posts-query-repo';
import { PostService } from '../application/posts.service';
import { PostsViewType } from '../../../infrastructure/posts/types/posts-view-type';
import { CommentsViewType } from '../../../infrastructure/comments/types/comments-view-type';
import { CommentsQueryRepo } from '../../../infrastructure/comments/comments.query.repo';
import { Pagination, PaginationType } from '../../../../common/pagination';
import { CreateCommentDto } from '../../comments/createComment.Dto';
import { ResultCode } from '../../../../exception-handler/result-code-enum';
import { exceptionHandler } from '../../../../exception-handler/exception-handler';
import { BasicAuthGuard } from '../../auth/guards/basic-auth.guard';
import { AccessTokenGuard } from '../../auth/guards/access-token.guard';
import { settings } from '../../../../settings';
import { JwtService } from '../../../../jwt/jwt.service';
import { CreateLikeDto } from '../../like/createLikeDto';
import { CommandBus } from '@nestjs/cqrs';
import { PostLikeUpdateCommand } from '../../like/use-cases/post-like-update-use-case';
import { CommentCreateCommand } from '../../comments/application,use-cases/comment-create-use-case';
import { UserId } from '../../../../decorators/UserId';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postQueryRepo: PostsQueryRepo,
    private readonly commentsQueryRepo: CommentsQueryRepo,
    private readonly postService: PostService,
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
    @Request() req,
    @Param('id') postId: string,
    @Query() query: Pagination<PaginationType>,
  ) {
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

    const getCommentsForPost: QueryPaginationType<CommentsViewType[]> | null =
      await this.commentsQueryRepo.getCommentsForPost(postId, query, userId);

    if (!getCommentsForPost) {
      return exceptionHandler(ResultCode.NotFound);
    }
    return getCommentsForPost;
  }

  @UseGuards(AccessTokenGuard) // should be logged user with refreshToken
  @Post(':id/comments')
  async createCommentByPostId(
    @UserId() userId,
    @Param('id') postId: string,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    const commentId = await this.commandBus.execute(
      new CommentCreateCommand(createCommentDto, postId, userId),
    );

    if (commentId.code !== ResultCode.Success) {
      return exceptionHandler(commentId.code);
    }

    const comment = await this.commentsQueryRepo.getComment(commentId.data);

    return comment;
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
