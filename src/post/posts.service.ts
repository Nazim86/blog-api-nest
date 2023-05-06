import { BlogRepository } from '../blogs/blog.repository';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModuleType } from './post.entity';
import { Model } from 'mongoose';
import { PostsViewType } from './types/posts-view-type';
import { CreatePostDto } from './createPostDto';
import { PostsQueryRepo } from './posts-query-repo';
import { PostRepository } from './post.repository';

@Injectable()
export class PostService {
  private blogRepository: BlogRepository;
  // private postRepository:PostRepository
  private postQueryRepo: PostsQueryRepo;
  private userRepository: UserRepository;

  constructor(
    protected postRepository: PostRepository,
    @InjectModel(Post.name) private PostModel: PostModuleType,
  ) {}

  async createPost(
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
  ): Promise<PostsViewType | null> {
    const blog = await this.blogRepository.getBlogById(blogId);
    if (!blog) return null;

    const newPost = new PostsDbType(
      new ObjectId(),
      title,
      shortDescription,
      content,
      blogId,
      blog.name,
      new Date().toISOString(),
      { likesCount: 0, dislikesCount: 0, myStatus: 'None', newestLikes: [] },
    );

    return await this.postRepository.createPost(newPost);
  }

  async createPostForBlog(
    creatPostDto: CreatePostDto,
  ): Promise<PostsViewType | null> {
    const blogById = await this.blogRepository.getBlogById(creatPostDto.blogId);

    if (!blogById) return null;

    const newPost = await this.PostModel.createPost(
      creatPostDto,
      this.PostModel,
    );
    // new PostsDbType(
    //   new ObjectId(),
    //   title,
    //   shortDescription,
    //   content,
    //   blogId.toString(),
    //   blogById.name,
    //   new Date().toISOString(),
    //   { likesCount: 0, dislikesCount: 0, myStatus: 'None', newestLikes: [] },
    // );

    return await this.postRepository.createPostForBlog(createPostForBlog);
  }

  // async getPostById(postId:string,userId?:string): Promise<PostsViewType |boolean> {
  //     return await this.postQueryRepo.getPostById(postId,userId)
  // }

  async updatePost(
    id: string,
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
  ): Promise<boolean> {
    return await this.postRepository.updatePost(
      id,
      title,
      shortDescription,
      content,
      blogId,
    );
  }

  async updatePostLikeStatus(
    postId: string,
    userId: string,
    likeStatus: string,
  ) {
    const getPost: PostsViewType | boolean =
      await this.postQueryRepo.getPostById(postId, userId);

    if (!getPost) return false;

    const getUser = await this.userRepository.findUserById(userId);

    let login = 'undefined';

    if (getUser) {
      login = getUser.accountData.login;
    }

    return await this.postRepository.updatePostLikeStatus(
      postId,
      userId,
      likeStatus,
      login,
    );
  }

  async deletePostById(id: string): Promise<boolean> {
    return this.postRepository.deletePostById(id);
  }
}
