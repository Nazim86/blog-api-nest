import { BlogRepository } from '../blogs/blog.repository';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument, PostModuleType } from './post.entity';
import { PostsViewType } from './types/posts-view-type';
import { CreatePostDto } from './createPostDto';
import { PostsQueryRepo } from './posts-query-repo';
import { PostRepository } from './post.repository';
import { BlogDocument } from '../blogs/blog.entity';

@Injectable()
export class PostService {
  private blogRepository: BlogRepository;
  // private postRepository:PostRepository
  private postQueryRepo: PostsQueryRepo;
  // private userRepository: UserRepository;

  constructor(
    protected postRepository: PostRepository,
    @InjectModel(Post.name) private PostModel: PostModuleType,
  ) {}

  async createPost(createPostDto: CreatePostDto): Promise<PostsViewType> {
    const blog: BlogDocument = await this.blogRepository.getBlogById(
      createPostDto.blogId,
    );
    if (!blog) return null;

    const newPost: PostDocument = this.PostModel.createPost(
      createPostDto,
      this.PostModel,
      blog.name,
    );

    return await this.postRepository.createPost(newPost);
  }

  async createPostForBlog(
    creatPostDto: CreatePostDto,
  ): Promise<PostsViewType | null> {
    const blog: BlogDocument = await this.blogRepository.getBlogById(
      creatPostDto.blogId,
    );

    if (!blog) return null;

    const newPost = await this.PostModel.createPost(
      creatPostDto,
      this.PostModel,
      blog.name,
    );

    return await this.postRepository.createPostForBlog(newPost);
  }

  // async getPostById(postId:string,userId?:string): Promise<PostsViewType |boolean> {
  //     return await this.postQueryRepo.getPostById(postId,userId)
  // }

  async updatePost(
    postId: string,
    updatePostDto: CreatePostDto,
  ): Promise<PostDocument | null> {
    const post: PostDocument = await this.postRepository.getPostById(postId);

    if (!post) return null;

    post.updatePost(updatePostDto);
    return this.postRepository.save(post);
  }

  // async updatePostLikeStatus(
  //   postId: string,
  //   userId: string,
  //   likeStatus: string,
  // ) {
  //   const getPost: PostsViewType | boolean =
  //     await this.postQueryRepo.getPostById(postId, userId);
  //
  //   if (!getPost) return false;
  //
  //   const getUser = await this.userRepository.findUserById(userId);
  //
  //   let login = 'undefined';
  //
  //   if (getUser) {
  //     login = getUser.accountData.login;
  //   }
  //
  //   return await this.postRepository.updatePostLikeStatus(
  //     postId,
  //     userId,
  //     likeStatus,
  //     login,
  //   );
  // }

  async deletePostById(id: string): Promise<boolean> {
    return this.postRepository.deletePostById(id);
  }
}
