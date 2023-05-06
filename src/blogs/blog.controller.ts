import {
  Body,
  Controller,
  Get,
  HttpException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { QueryPaginationType } from '../types/query-pagination-type';
import { BlogsViewType } from './types/blogs-view-type';
import { BlogQueryRepo } from './blog.queryRepo';
import { PaginationType } from '../types/pagination.type';
import { PostsViewType } from '../post/types/posts-view-type';
import { PostsQueryRepo } from '../post/posts-query-repo';
import { BlogService } from './blog.service';

@Controller('blogs')
export class BlogController {
  constructor(
    protected blogQueryRepo: BlogQueryRepo,
    protected postQueryRepo: PostsQueryRepo,
    protected blogService: BlogService, // protected jwtService: JwtService, // , // protected postQueryRepo: PostsQueryRepo, // protected postService: PostService,
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
  async createBlog(@Body() blogDto) {
    const newBlog: BlogsViewType = await this.blogService.createBlog(blogDto);

    // if (newBlog) {
    //   res.status(201).send(newBlog);
    // }
  }

  // async createPostByBlogId(req: Request, res: Response) {
  //   const title = req.body.title;
  //   const shortDescription = req.body.shortDescription;
  //   const content = req.body.content;
  //   const blogId = req.params.blogId;
  //
  //   const newPostForBlog: PostsViewType | null =
  //     await this.postService.createPostForBlog(
  //       title,
  //       shortDescription,
  //       content,
  //       blogId,
  //     );
  //
  //   if (!newPostForBlog) {
  //     return res.sendStatus(404);
  //   }
  //
  //   res.status(201).send(newPostForBlog);
  // }
  //

  // async updateBlog(req: Request, res: Response) {
  //   const name = req.body.name;
  //   const description = req.body.description;
  //   const websiteUrl = req.body.websiteUrl;
  //
  //   const updateBlog: boolean = await this.blogService.updateBlog(
  //     req.params.id,
  //     name,
  //     description,
  //     websiteUrl,
  //   );
  //
  //   if (!updateBlog) {
  //     return res.sendStatus(404);
  //   }
  //   res.sendStatus(204);
  // }
  //
  // async deleteBlog(req: Request, res: Response) {
  //   const deleteBlog: boolean = await this.blogService.deleteBlogById(
  //     req.params.id,
  //   );
  //
  //   if (!deleteBlog) {
  //     return res.sendStatus(404);
  //   }
  //   res.sendStatus(204);
  // }
}
