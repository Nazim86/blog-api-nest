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
} from '@nestjs/common';
import { QueryPaginationType } from '../types/query-pagination-type';
import { PostsQueryRepo } from './posts-query-repo';
import { PostService } from './posts.service';
import { CreatePostDto } from './createPostDto';
import { PostDocument } from './post.entity';
import { PostsViewType } from './types/posts-view-type';
import { CommentsViewType } from '../comments/types/comments-view-type';
import { CommentsQueryRepo } from '../comments/comments.query.repo';
import { Pagination, PaginationType } from '../common/pagination';

@Controller('posts')
export class PostsController {
  constructor(
    protected postQueryRepo: PostsQueryRepo,
    protected commentsQueryRepo: CommentsQueryRepo,
    protected postService: PostService, // protected commentService: CommentService, // protected jwtService: JwtService,
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
  async getPostById(
    @Param('id') postId: string,
  ): Promise<PostsViewType | boolean> {
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
      throw new HttpException('Not Found', 404);
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
      throw new HttpException('Not Found', 404);
    }
    return getCommentsForPost;
    // res.status(200).send(getCommentsForPost);
  }

  @Post()
  async createPost(@Body() createPostDto: CreatePostDto) {
    const newPost: PostsViewType | null = await this.postService.createPost(
      createPostDto,
    );
    if (!newPost) {
      throw new HttpException('Not Found', 404);
      // res.sendStatus(404);
    }
    return newPost;
    // res.status(201).send(newPost);
  }

  // @Post()
  // async createCommentByPostId(req: Request, res: Response) {
  //   const postId = req.params.postId;
  //   const content = req.body.content;
  //   const userId = req.context.user!._id.toString();
  //   const userLogin = req.context.user!.accountData.login;
  //
  //   const postComment: CommentsViewType | null =
  //     await this.commentService.createPostComment(
  //       postId,
  //       content,
  //       userId,
  //       userLogin,
  //     );
  //
  //   if (!postComment) {
  //     throw new HttpException('Not Found', 404);
  //   }
  //   return postComment;
  //   // res.status(201).send(postComment);
  // }

  @Put(':id')
  @HttpCode(204)
  async updatePost(
    @Param('id') postId: string,
    @Body() updatePostDto: CreatePostDto,
  ) {
    const updatePost: PostDocument | null = await this.postService.updatePost(
      postId,
      updatePostDto,
    );

    if (!updatePost) {
      throw new HttpException('Not Found', 404);
    }
    return;
    // res.sendStatus(204);
  }

  // async updatePostLikeStatus(req: Request, res: Response) {
  //   const likeStatus = req.body.likeStatus;
  //   const postId = req.params.id;
  //   const userId = req.context.user!._id.toString();
  //
  //   const updateLikeStatus: boolean =
  //     await this.postService.updatePostLikeStatus(postId, userId, likeStatus);
  //
  //   if (!updateLikeStatus) {
  //     throw new HttpException('Not Found', 404);
  //   }
  //   return;
  //   // res.sendStatus(204);
  // }

  @Delete(':id')
  @HttpCode(204)
  async deletePost(@Param() postId: string) {
    const deletePost: boolean = await this.postService.deletePostById(postId);

    if (!deletePost) {
      throw new HttpException('Not Found', 404);
    }
    return;
    // res.sendStatus(204);
  }
}
