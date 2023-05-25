import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { QueryPaginationType } from '../../types/query-pagination-type';
import { PostsQueryRepo } from '../infrastructure/posts-query-repo';
import { PostService } from '../application/posts.service';
import { CreatePostDto } from '../createPostDto';
import { PostsViewType } from '../types/posts-view-type';
import { CommentsViewType } from '../../comments/types/comments-view-type';
import { CommentsQueryRepo } from '../../comments/infrastructure/comments.query.repo';
import { Pagination, PaginationType } from '../../common/pagination';
import { CommentService } from '../../comments/application/comments.service';
import { CreateCommentDto } from '../../comments/createComment.Dto';
import { LikeEnum } from '../../like/like.enum';
import { ResultCode } from '../../exception-handler/result-code-enum';
import { exceptionHandler } from '../../exception-handler/exception-handler';
import { BasicAuthGuard } from '../../auth/guards/basic-auth.guard';
import { AccessTokenGuard } from '../../auth/guards/access-token.guard';

@Controller('posts')
export class PostsController {
  constructor(
    protected postQueryRepo: PostsQueryRepo,
    protected commentsQueryRepo: CommentsQueryRepo,
    protected postService: PostService,
    protected commentService: CommentService, // protected jwtService: JwtService,
  ) {}

  @Get()
  async getPosts(@Query() query: Pagination<PaginationType>) {
    // const accessToken: string | undefined =
    //   req.headers.authorization?.split(' ')[1];

    const userId = undefined;

    // if (accessToken) {
    //   const tokenData = await this.jwtService.getTokenMetaData(
    //     accessToken,
    //     settings.ACCESS_TOKEN_SECRET,
    //   );
    //   if (tokenData) {
    //     userId = tokenData.userId;
    //   }
    // }

    const getPost: QueryPaginationType<PostsViewType[]> =
      await this.postQueryRepo.getPosts(query, userId);
    return getPost;
    // res.status(200).send(getPost);
  }

  @Get(':id')
  async getPostById(@Param('id') postId: string) {
    // const accessToken: string | undefined =
    //   req.headers.authorization?.split(' ')[1];

    const userId = undefined;

    // if (accessToken) {
    //   const tokenData = await this.jwtService.getTokenMetaData(
    //     accessToken,
    //     settings.ACCESS_TOKEN_SECRET,
    //   );
    //   if (tokenData) {
    //     userId = tokenData.userId;
    //   }
    // }

    const getPost: PostsViewType | boolean =
      await this.postQueryRepo.getPostById(postId);

    if (!getPost) {
      return exceptionHandler(ResultCode.NotFound);
    }
    return getPost;
    // res.status(200).send(getPost);
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

  @UseGuards(BasicAuthGuard)
  @Post()
  async createPost(@Body() createPostDto: CreatePostDto) {
    const postId: string | null = await this.postService.createPost(
      createPostDto,
    );
    if (!postId) {
      throw new HttpException('Not Found', 404);
      // res.sendStatus(404);
    }
    return await this.postQueryRepo.getPostById(postId);
    // res.status(201).send(newPost);
  }

  @UseGuards(AccessTokenGuard) // should be logged user with refreshToken
  @Post(':id/comments')
  async createCommentByPostId(
    @Request() req,
    @Param('id') postId: string,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    const userId = req.user.id; //req.context.user!._id.toString();
    const userLogin = req.user.login; //req.context.user!.accountData.login;

    console.log(req.user, req.user.id, req.user.login);

    const commentId: string | null =
      await this.commentService.createPostComment(
        createCommentDto,
        postId,
        userId,
        userLogin,
      );

    if (!commentId) {
      return exceptionHandler(ResultCode.NotFound);
    }
    return await this.commentsQueryRepo.getComment(commentId);
  }

  @UseGuards(BasicAuthGuard)
  @Put(':id')
  @HttpCode(204)
  async updatePost(
    @Param('id') postId: string,
    @Body() updatePostDto: CreatePostDto,
  ) {
    const updatePost: boolean = await this.postService.updatePost(
      postId,
      updatePostDto,
    );

    if (!updatePost) {
      return exceptionHandler(ResultCode.NotFound);
    }
    return;
  }

  @UseGuards(AccessTokenGuard)
  @Put(':id/like-status')
  async updatePostLikeStatus(
    @Request() req,
    @Param('id') postId: string,
    @Body() likeStatus: LikeEnum,
  ) {
    const userId = req.userId; //req.context.user!._id.toString();

    const isUpdated: boolean = await this.postService.updatePostLikeStatus(
      postId,
      userId,
      likeStatus,
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
