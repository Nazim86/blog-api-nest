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
import { QueryPaginationType } from '../../types/query-pagination-type';
import { BlogsViewType } from '../infrastructure/types/blogs-view-type';
import { BlogQueryRepo } from '../infrastructure/blog.queryRepo';
import { PostsViewType } from '../../post/types/posts-view-type';
import { PostsQueryRepo } from '../../post/infrastructure/posts-query-repo';
import { BlogService } from '../application/blog.service';
import { CreateBlogDto } from '../createBlog.dto';
import { CreatePostDto } from '../../post/createPostDto';
import { PostService } from '../../post/application/posts.service';
import { BlogDocument } from '../domain/blog.entity';
import { BlogPagination } from '../domain/blog-pagination';
import { PaginationType } from '../../common/pagination';
import { BasicAuthGuard } from '../../auth/guards/basic-auth.guard';
import { settings } from '../../settings';
import { JwtService } from '../../jwt/jwt.service';
import { exceptionHandler } from '../../exception-handler/exception-handler';
import { ResultCode } from '../../exception-handler/result-code-enum';

@Controller('blogs')
export class BlogController {
  constructor(
    protected blogQueryRepo: BlogQueryRepo,
    protected postQueryRepo: PostsQueryRepo,
    protected blogService: BlogService,
    protected postService: PostService,
    protected jwtService: JwtService, // , // protected postQueryRepo: PostsQueryRepo, // ,
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
    // res.status(200).send(getBlog);
  }

  @Get(':id/posts')
  @HttpCode(200)
  async getPostsByBlogId(
    @Param('id') blogId: string,
    @Query() query: BlogPagination<PaginationType>,
    @Request() req,
  ) {
    // const paginatedQuery: BlogPagination = new BlogPagination(query);

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
    // res.status(200).send(getBlogByBlogId);
  }

  @UseGuards(BasicAuthGuard)
  @Post()
  async createBlog(@Body() createBlogDto: CreateBlogDto) {
    const blogId: string = await this.blogService.createBlog(createBlogDto);

    return await this.blogQueryRepo.getBlogById(blogId);
  }

  @UseGuards(BasicAuthGuard)
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
    // res.status(201).send(newPostForBlog);
  }

  @UseGuards(BasicAuthGuard)
  @Put(':id')
  @HttpCode(204)
  async updateBlog(
    @Param('id') blogId: string,
    @Body() updateBlogDto: CreateBlogDto,
  ) {
    const updateBlog: BlogDocument = await this.blogService.updateBlog(
      blogId,
      updateBlogDto,
    );

    if (!updateBlog) {
      return exceptionHandler(ResultCode.NotFound);
    }
    return;
    // res.sendStatus(204);
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(204)
  async deleteBlog(@Param('id') blogId) {
    const deleteBlog: boolean = await this.blogService.deleteBlogById(blogId);

    if (!deleteBlog) {
      return exceptionHandler(ResultCode.NotFound);
    }
    return;
    // res.sendStatus(204);
  }
}
