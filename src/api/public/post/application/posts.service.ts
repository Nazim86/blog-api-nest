import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostModelType } from '../../../entities/post.entity';
import { PostRepository } from '../../../infrastructure/posts/post.repository';
import { PostLike, PostLikeModelType } from '../../../entities/postLike.entity';

@Injectable()
export class PostService {
  constructor(
    protected postRepository: PostRepository,

    @InjectModel(Post.name) private PostModel: PostModelType,
    @InjectModel(PostLike.name) private PostLikeModel: PostLikeModelType,
  ) {}

  // async getPostById(postId:string,userId?:string): Promise<PostsViewType |boolean> {
  //     return await this.postQueryRepo.getPostById(postId,userId)
  // }

  async deletePostById(id: string): Promise<boolean> {
    return await this.postRepository.deletePostById(id);
  }
}
