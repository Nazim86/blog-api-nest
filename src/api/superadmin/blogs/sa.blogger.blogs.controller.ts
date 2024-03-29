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
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { BlogRepository } from '../../infrastructure/blogs/blog.repository';
import { BlogsQueryRepo } from '../../infrastructure/blogs/blogs-query.repository';
import { PostsQueryRepo } from '../../infrastructure/posts/posts-query-repo';
import { CommentsQueryRepo } from '../../infrastructure/comments/comments.query.repo';
import { BlogPagination } from '../../infrastructure/blogs/blog-pagination';
import { UserId } from '../../../decorators/UserId';
import { PaginationType } from '../../../common/pagination';
import { BlogsViewType } from '../../infrastructure/blogs/types/blogs-view-type';
import { RoleEnum } from '../../../enums/role-enum';
import { CreateBlogDto } from '../../blogger/inputModel-Dto/createBlog.dto';
import { BlogCreateCommand } from '../../blogger/application,use-cases/blog-create-use-case';
import { CreatePostDto } from '../../public/post/createPostDto';
import { ResultCode } from '../../../exception-handler/result-code-enum';
import { exceptionHandler } from '../../../exception-handler/exception-handler';
import { Result } from '../../../exception-handler/result-type';
import { PostUpdateCommand } from '../../blogger/application,use-cases/post-update-use-case';
import { PostDeleteCommand } from '../../blogger/application,use-cases/post-delete-use-case';
import { BlogDeleteCommand } from '../../blogger/application,use-cases/blog-delete-use-case';
import { PostCreateCommand } from '../../blogger/application,use-cases/post-create-use-case';
import { BlogUpdateCommand } from '../../blogger/application,use-cases/blog-update-use-case';
import { QueryPaginationType } from '../../../types/query-pagination-type';
import { BasicAuthGuard } from '../../public/auth/guards/basic-auth.guard';

@UseGuards(BasicAuthGuard)
@Controller('sa/blogs')
export class SaBloggerBlogsController {
  constructor(
    private commandBus: CommandBus,
    private readonly blogsRepository: BlogRepository,
    private readonly blogQueryRepo: BlogsQueryRepo,
    private readonly postQueryRepo: PostsQueryRepo,
    private readonly commentsQueryRepo: CommentsQueryRepo,
  ) {}

  @Get()
  async getBlogs(
    @Query()
    query: BlogPagination<PaginationType>,
    @UserId() userId: string,
  ) {
    const getBlog: QueryPaginationType<BlogsViewType[]> =
      await this.blogQueryRepo.getBlog(query, RoleEnum.Blogger, userId);

    return getBlog;
  }

  @Get('comments')
  async getCommentsForBlog(
    @Query() query: PaginationType,
    @UserId() userId: string,
  ) {
    return await this.commentsQueryRepo.getCommentForBlogger(query, userId);
  }

  @Get(':blogId/posts')
  async getPostsForBlog(
    @Param('blogId') blogId: string,
    @Query() query: PaginationType,
    @UserId() userId: string,
  ) {
    return await this.postQueryRepo.getPostsByBlogId(query, blogId, userId);
  }

  @Post()
  async createBlog(
    @Body() createBlogDto: CreateBlogDto,
    @UserId() userId: string,
  ) {
    const blogId: string = await this.commandBus.execute(
      new BlogCreateCommand(userId, createBlogDto),
    );

    return await this.blogQueryRepo.getBlogById(blogId);
  }

  @Post(':id/posts')
  @HttpCode(201)
  async createPostByBlogId(
    @Param('id') blogId: string,
    @Body() createPostDto: CreatePostDto,
    @UserId() userId: string,
  ) {
    const postId = await this.commandBus.execute(
      new PostCreateCommand(userId, blogId, createPostDto),
    );

    if (postId.code !== ResultCode.Success) {
      return exceptionHandler(postId.code);
    }
    return await this.postQueryRepo.getPostById(postId.data);
  }

  @HttpCode(204)
  @Put(':id')
  async updateBlog(
    @Param('id') blogId: string,
    @UserId() userId: string,
    @Body() updateBlogDto: CreateBlogDto,
  ) {
    const isUpdated: Result<ResultCode> = await this.commandBus.execute(
      new BlogUpdateCommand(userId, blogId, updateBlogDto),
    );

    if (isUpdated.code !== ResultCode.Success) {
      return exceptionHandler(isUpdated.code);
    }
    return;
  }

  @Put(':blogId/posts/:postId')
  @HttpCode(204)
  async updatePost(
    @Param() params,
    @Body() updatePostDto: CreatePostDto,
    @UserId() userId: string,
  ) {
    const isPostUpdated: Result<ResultCode> = await this.commandBus.execute(
      new PostUpdateCommand(userId, params, updatePostDto),
    );

    if (isPostUpdated.code !== ResultCode.Success) {
      return exceptionHandler(isPostUpdated.code);
    }
    return;
  }

  //@UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(204)
  async deleteBlog(@Param('id') blogId, @UserId() userId: string) {
    const isBlogDeleted: Result<ResultCode> = await this.commandBus.execute(
      new BlogDeleteCommand(userId, blogId),
    );

    if (isBlogDeleted.code !== ResultCode.Success) {
      return exceptionHandler(isBlogDeleted.code);
    }
    return;
  }

  @Delete(':blogId/posts/:postId')
  @HttpCode(204)
  async deletePost(@Param() params, @UserId() userId: string) {
    const isPostDeleted: Result<ResultCode> = await this.commandBus.execute(
      new PostDeleteCommand(userId, params),
    );

    if (isPostDeleted.code !== ResultCode.Success) {
      return exceptionHandler(isPostDeleted.code);
    }
    return;
  }
}
