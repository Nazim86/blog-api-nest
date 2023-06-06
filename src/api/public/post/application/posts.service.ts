import { BlogRepository } from '../../blogs/infrastructure/blog.repository';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument, PostModelType } from '../domain/post.entity';
import { CreatePostDto } from '../createPostDto';
import { PostRepository } from '../infrastructure/post.repository';
import { BlogDocument } from '../../blogs/domain/blog.entity';
import { PostsQueryRepo } from '../infrastructure/posts-query-repo';
import { UsersRepository } from '../../../superadmin/users/infrastructure/users.repository';
import {
  PostLike,
  PostLikeDocument,
  PostLikeModelType,
} from '../../../../like/postLike.entity';
import { LikesRepository } from '../../../../like/likes.repository';
import { CreateLikeDto } from '../../../../like/createLikeDto';

@Injectable()
export class PostService {
  constructor(
    protected blogRepository: BlogRepository,
    protected postRepository: PostRepository,
    protected postQueryRepo: PostsQueryRepo,
    protected userRepository: UsersRepository,
    protected likesRepository: LikesRepository,
    @InjectModel(Post.name) private PostModel: PostModelType,
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
  ): Promise<string | null> {
    const blog: BlogDocument = await this.blogRepository.getBlogById(blogId);

    if (!blog) return null;

    const newPost = await this.PostModel.createPost(
      creatPostDto,
      this.PostModel,
      blog,
    );

    await this.postRepository.save(newPost);

    return newPost.id;
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
    createPostLikeDto: CreateLikeDto,
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

    if (!postLike) {
      const postLike = this.PostLikeModel.createPostLike(
        postId,
        userId,
        createPostLikeDto,
        login,
        this.PostLikeModel,
      );

      await this.likesRepository.save(postLike);
      return true;
    }

    postLike.updatePostLikeStatus(createPostLikeDto);

    await this.likesRepository.save(postLike);

    return true;
  }

  async deletePostById(id: string): Promise<boolean> {
    return await this.postRepository.deletePostById(id);
  }
}
