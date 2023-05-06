import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { QueryPaginationType } from '../types/query-pagination-type';
import { BlogsViewType } from './types/blogs-view-type';
import { BlogQueryRepo } from './blog.queryRepo';
import { PaginationType } from '../types/pagination.type';
import { PostsViewType } from '../post/types/posts-view-type';
import { PostsQueryRepo } from '../post/posts-query-repo';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './createBlog.dto';
import { CreatePostDto } from '../post/createPostDto';
import { PostService } from '../post/posts.service';
import { BlogDocument } from './blog.entity';

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
    query: PaginationType,
  ) {
    const getBlog: QueryPaginationType<BlogsViewType[]> =
      await this.blogQueryRepo.getBlog(
        query.searchName,
        query.sortBy,
        query.sortDirection,
        query.pageNumber,
        query.pageSize,
      );

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
    @Query() query: PaginationType,
  ) {
    const userId = undefined;

    const getBlogByBlogId: QueryPaginationType<PostsViewType[]> | boolean =
      await this.postQueryRepo.getPostsByBlogId(
        query.pageNumber,
        query.pageSize,
        query.sortBy,
        query.sortDirection,
        blogId,
        userId,
      );

    if (!getBlogByBlogId) {
      throw new HttpException('Not Found', 404);
    }
    return getBlogByBlogId;
    // res.status(200).send(getBlogByBlogId);
  }

  @Post()
  async createBlog(@Body() createBlogDto: CreateBlogDto) {
    const newBlog: BlogsViewType = await this.blogService.createBlog(
      createBlogDto,
    );

    // if (newBlog) {
    //   res.status(201).send(newBlog);
    // }
  }

  @Post(':id/posts')
  async createPostByBlogId(
    @Param('id') blogId: string,
    @Body() createPostDto: CreatePostDto,
  ) {
    const newPostForBlog: PostsViewType | null =
      await this.postService.createPostForBlog(createPostDto);

    if (!newPostForBlog) {
      throw new HttpException('Not Found', 404);
    }

    // res.status(201).send(newPostForBlog);
  }

  @Put(':id')
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
    // res.sendStatus(204);
  }

  @Delete(':id')
  async deleteBlog(@Param('id') blogId) {
    const deleteBlog: boolean = await this.blogService.deleteBlogById(blogId);

    if (!deleteBlog) {
      throw new HttpException('Not Found', 404);
    }
    // res.sendStatus(204);
  }
}