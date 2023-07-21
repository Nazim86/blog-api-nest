import {
  Controller,
  Get,
  HttpCode,
  Param,
  Query,
  Request,
} from '@nestjs/common';
import { QueryPaginationType } from '../../../../types/query-pagination-type';
import { BlogsViewType } from '../../../infrastructure/blogs/types/blogs-view-type';
import { BlogsQueryRepo } from '../../../infrastructure/blogs/blogs-query.repository';
import { PostsViewType } from '../../../infrastructure/posts/types/posts-view-type';
import { PostsQueryRepo } from '../../../infrastructure/posts/posts-query-repo';
import { BlogPagination } from '../../../infrastructure/blogs/blog-pagination';
import { PaginationType } from '../../../../common/pagination';
import { settings } from '../../../../settings';
import { JwtService } from '../../../../jwt/jwt.service';
import { exceptionHandler } from '../../../../exception-handler/exception-handler';
import { ResultCode } from '../../../../exception-handler/result-code-enum';
import { CommandBus } from '@nestjs/cqrs';

@Controller('blogs')
export class PublicBlogsController {
  constructor(
    private commandBus: CommandBus,
    private readonly blogQueryRepo: BlogsQueryRepo,
    private readonly postQueryRepo: PostsQueryRepo,
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
