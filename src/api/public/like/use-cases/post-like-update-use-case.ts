import { CommandHandler } from '@nestjs/cqrs';
import { CreateLikeDto } from '../createLikeDto';
import { PostRepository } from '../../../infrastructure/posts/post.repository';
import { UsersRepository } from '../../../infrastructure/users/users.repository';
import { LikesRepository } from '../../../infrastructure/likes/likes.repository';

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

    await this.userRepository.findUserById(command.userId);

    // let login = 'undefined';
    //
    // if (user) {
    //   login = user.login;
    // }

    await this.likesRepository.createPostLike(
      command.postId,
      command.userId,
      command.createPostLikeDto,
    );

    return true;
  }
}
