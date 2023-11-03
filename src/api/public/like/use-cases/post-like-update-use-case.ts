import { CommandHandler } from '@nestjs/cqrs';
import { CreateLikeDto } from '../createLikeDto';
import { PostRepository } from '../../../infrastructure/posts/post.repository';
import { UsersRepository } from '../../../infrastructure/users/users.repository';
import { LikesRepository } from '../../../infrastructure/likes/likes.repository';
import { PostLike } from '../../../entities/like/postLike.entity';

export class PostLikeUpdateCommand {
  constructor(
    public postId: string,
    public userId: string,
    public createPostLikeDto: CreateLikeDto,
  ) {}
}

@CommandHandler(PostLikeUpdateCommand)
export class PostLikeUpdateUseCase {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly userRepository: UsersRepository,
    private readonly likesRepository: LikesRepository,
  ) {}
  async execute(command: PostLikeUpdateCommand): Promise<boolean> {
    const post = await this.postRepository.getPostById(command.postId);

    if (!post) return false;

    const user = await this.userRepository.findUserById(command.userId);

    const postLike = await this.likesRepository.findPostLike(post.id, user.id);

    if (!user) return false;

    if (!postLike) {
      const newPostLike = new PostLike();
      newPostLike.post = post;
      newPostLike.user = user;
      newPostLike.addedAt = new Date();
      newPostLike.status = command.createPostLikeDto.likeStatus;
      await this.likesRepository.savePostLike(newPostLike);
    } else {
      postLike.status = command.createPostLikeDto.likeStatus;
      await this.likesRepository.savePostLike(postLike);
    }

    return true;
  }
}
