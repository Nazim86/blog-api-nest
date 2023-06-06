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
import { QueryPaginationType } from '../../types/query-pagination-type';
import { BlogsViewType } from '../../blogs/infrastructure/types/blogs-view-type';
import { BlogsQueryRepo } from '../../blogs/infrastructure/blogs-query.repository';
import { PostsQueryRepo } from '../../post/infrastructure/posts-query-repo';
import { CreateBlogDto } from '../../blogs/createBlog.dto';
import { CreatePostDto } from '../../post/createPostDto';
import { PostService } from '../../post/application/posts.service';
import { BlogDocument } from '../../blogs/domain/blog.entity';
import { BlogPagination } from '../../blogs/domain/blog-pagination';
import { PaginationType } from '../../common/pagination';
import { JwtService } from '../../jwt/jwt.service';
import { exceptionHandler } from '../../exception-handler/exception-handler';
import { ResultCode } from '../../exception-handler/result-code-enum';
import { CommandBus } from '@nestjs/cqrs';
import { BlogCreateCommand } from './application,use-cases/blog-create-use-case';
import { BlogUpdateCommand } from './application,use-cases/blog-update-use-case';
import { AccessTokenGuard } from '../public/auth/guards/access-token.guard';
import { UserId } from '../../decorators/UserId';
import { BlogDeleteCommand } from './application,use-cases/blog-delete-use-case';
import { Result } from '../../exception-handler/result-type';

@UseGuards(AccessTokenGuard)
@Controller('blogger/blogs')
export class BloggerController {
  constructor(
    private commandBus: CommandBus,
    private readonly blogQueryRepo: BlogsQueryRepo,
    private readonly postQueryRepo: PostsQueryRepo,
    private readonly postService: PostService,
    private readonly jwtService: JwtService, // , // protected postQueryRepo: PostsQueryRepo, // ,
  ) {}

  @Get()
  async getBlogs(
    @Query()
    query: BlogPagination<PaginationType>,
  ) {
    const getBlog: QueryPaginationType<BlogsViewType[]> =
      await this.blogQueryRepo.getBlog(query);

    return getBlog;
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
  ) {
    const postId: string | null = await this.postService.createPostForBlog(
      blogId,
      createPostDto,
    );

    if (!postId) {
      return exceptionHandler(ResultCode.NotFound);
    }
    return await this.postQueryRepo.getPostById(postId);
  }

  @HttpCode(204)
  @Put(':id')
  async updateBlog(
    @Param('id') blogId: string,
    @UserId() userId: string,
    @Body() updateBlogDto: CreateBlogDto,
  ) {
    const updateBlog: BlogDocument = await this.commandBus.execute(
      new BlogUpdateCommand(userId, blogId, updateBlogDto),
    );

    if (!updateBlog) {
      return exceptionHandler(ResultCode.Forbidden);
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
}
