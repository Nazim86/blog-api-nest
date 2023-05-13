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

@Controller('blogs')
export class BlogController {
  constructor(
    protected blogQueryRepo: BlogQueryRepo,
    protected postQueryRepo: PostsQueryRepo,
    protected blogService: BlogService,
    protected postService: PostService, // protected jwtService: JwtService, // , // protected postQueryRepo: PostsQueryRepo, // ,
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
      throw new HttpException('Not Found', 404);
    }
    return getBlog;
    // res.status(200).send(getBlog);
  }

  @Get(':id/posts')
  async getPostsByBlogId(
    @Param('id') blogId: string,
    @Query() query: BlogPagination<PaginationType>,
  ) {
    // const paginatedQuery: BlogPagination = new BlogPagination(query);
    const userId = undefined;

    const getBlogByBlogId: QueryPaginationType<PostsViewType[]> | boolean =
      await this.postQueryRepo.getPostsByBlogId(query, blogId, userId);

    if (!getBlogByBlogId) {
      throw new HttpException('Not Found', 404);
    }
    return getBlogByBlogId;
    // res.status(200).send(getBlogByBlogId);
  }

  @Post()
  async createBlog(@Body() createBlogDto: CreateBlogDto) {
    const blogId: string = await this.blogService.createBlog(createBlogDto);

    return await this.blogQueryRepo.getBlogById(blogId);
  }

  @Post(':id/posts')
  async createPostByBlogId(
    @Param('id') blogId: string,
    @Body() createPostDto: CreatePostDto,
  ) {
    const newPostForBlog: PostsViewType | null =
      await this.postService.createPostForBlog(blogId, createPostDto);

    if (!newPostForBlog) {
      throw new HttpException('Not Found', 404);
    }
    return newPostForBlog;
    // res.status(201).send(newPostForBlog);
  }

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
      throw new HttpException('Not Found', 404);
    }
    return;
    // res.sendStatus(204);
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteBlog(@Param('id') blogId) {
    const deleteBlog: boolean = await this.blogService.deleteBlogById(blogId);

    if (!deleteBlog) {
      throw new HttpException('Not Found', 404);
    }
    return;
    // res.sendStatus(204);
  }
}
