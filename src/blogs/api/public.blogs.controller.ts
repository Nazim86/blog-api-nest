import {
  Controller,
  Get,
  HttpCode,
  Param,
  Query,
  Request,
} from '@nestjs/common';
import { QueryPaginationType } from '../../types/query-pagination-type';
import { BlogsViewType } from '../../blogs/infrastructure/types/blogs-view-type';
import { BlogsQueryRepo } from '../../blogs/infrastructure/blogs-query.repository';
import { PostsViewType } from '../../post/types/posts-view-type';
import { PostsQueryRepo } from '../../post/infrastructure/posts-query-repo';
import { PostService } from '../../post/application/posts.service';
import { BlogPagination } from '../../blogs/domain/blog-pagination';
import { PaginationType } from '../../common/pagination';
import { settings } from '../../settings';
import { JwtService } from '../../jwt/jwt.service';
import { exceptionHandler } from '../../exception-handler/exception-handler';
import { ResultCode } from '../../exception-handler/result-code-enum';
import { CommandBus } from '@nestjs/cqrs';

@Controller('blogs')
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

  @Get(':id')
  async getBlogById(@Param('id') blogId: string) {
    const getBlog: BlogsViewType | boolean =
      await this.blogQueryRepo.getBlogById(blogId);

    if (!getBlog) {
      return exceptionHandler(ResultCode.NotFound);
    }
    return getBlog;
  }

  @Get(':id/posts')
  @HttpCode(200)
  async getPostsByBlogId(
    @Param('id') blogId: string,
    @Query() query: BlogPagination<PaginationType>,
    @Request() req,
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

    const getBlogByBlogId: QueryPaginationType<PostsViewType[]> | boolean =
      await this.postQueryRepo.getPostsByBlogId(query, blogId, userId);

    if (!getBlogByBlogId) {
      return exceptionHandler(ResultCode.NotFound);
    }
    return getBlogByBlogId;
  }
}
