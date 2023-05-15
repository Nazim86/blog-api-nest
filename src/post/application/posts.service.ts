import { BlogRepository } from '../../blogs/infrastructure/blog.repository';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument, PostModuleType } from '../domain/post.entity';
import { PostsViewType } from '../types/posts-view-type';
import { CreatePostDto } from '../createPostDto';
import { PostRepository } from '../infrastructure/post.repository';
import { BlogDocument } from '../../blogs/domain/blog.entity';
import { PostsQueryRepo } from '../infrastructure/posts-query-repo';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import {
  PostLike,
  PostLikeDocument,
  PostLikeModelType,
} from '../../like/postLike.entity';
import { LikesRepository } from '../../like/likes.repository';
import { LikeEnum } from '../../like/like.enum';

@Injectable()
export class PostService {
  constructor(
    protected blogRepository: BlogRepository,
    protected postRepository: PostRepository,
    protected postQueryRepo: PostsQueryRepo,
    protected userRepository: UsersRepository,
    protected likesRepository: LikesRepository,
    @InjectModel(Post.name) private PostModel: PostModuleType,
    @InjectModel(PostLike.name) private PostLikeModel: PostLikeModelType,
  ) {}

  async createPost(createPostDto: CreatePostDto): Promise<string> {
    const blog: BlogDocument = await this.blogRepository.getBlogById(
      createPostDto.blogId,
    );
    if (!blog) return null;

    const newPost: PostDocument = this.PostModel.createPost(
      createPostDto,
      this.PostModel,
      blog,
    );

    await this.postRepository.save(newPost);

    return newPost.id;
  }

  async createPostForBlog(
    blogId: string,
    creatPostDto: CreatePostDto,
  ): Promise<PostsViewType | null> {
    const blog: BlogDocument = await this.blogRepository.getBlogById(blogId);

    if (!blog) return null;

    const newPost = await this.PostModel.createPost(
      creatPostDto,
      this.PostModel,
      blog,
    );

    return await this.postRepository.createPostForBlog(newPost);
  }

  // async getPostById(postId:string,userId?:string): Promise<PostsViewType |boolean> {
  //     return await this.postQueryRepo.getPostById(postId,userId)
  // }

  async updatePost(
    postId: string,
    updatePostDto: CreatePostDto,
  ): Promise<boolean> {
    const post: PostDocument = await this.postRepository.getPostById(postId);

    if (!post) return false;

    post.updatePost(updatePostDto);
    await this.postRepository.save(post);
    return true;
  }

  async updatePostLikeStatus(
    postId: string,
    userId: string,
    likeStatus: LikeEnum,
  ): Promise<boolean> {
    const post: PostDocument | boolean = await this.postRepository.getPostById(
      postId,
    );

    if (!post) return false;

    const user = await this.userRepository.findUserById(userId);

    let login = 'undefined';

    if (user) {
      login = user.accountData.login;
    }

    const postLike: PostLikeDocument = await this.likesRepository.findPostLike(
      postId,
      userId,
    );

    if (!postLike) return false;

    postLike.updatePostLikeStatus(postId, userId, likeStatus, login);

    await this.likesRepository.save(postLike);

    return true;
  }

  async deletePostById(id: string): Promise<boolean> {
    return await this.postRepository.deletePostById(id);
  }
}
