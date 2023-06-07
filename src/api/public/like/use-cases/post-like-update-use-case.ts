import { CommandHandler } from '@nestjs/cqrs';
import { CreateLikeDto } from '../createLikeDto';
import { PostDocument } from '../../../../domains/post.entity';
import {
  PostLike,
  PostLikeDocument,
  PostLikeModelType,
} from '../../../../domains/postLike.entity';
import { PostRepository } from '../../post/infrastructure/post.repository';
import { UsersRepository } from '../../../superadmin/users/infrastructure/users.repository';
import { LikesRepository } from '../likes.repository';
import { InjectModel } from '@nestjs/mongoose';
import { UserDocument } from '../../../../domains/user.entity';

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
    @InjectModel(PostLike.name) private PostLikeModel: PostLikeModelType,
  ) {}
  async execute(command: PostLikeUpdateCommand): Promise<boolean> {
    const post: PostDocument | boolean = await this.postRepository.getPostById(
      command.postId,
    );

    if (!post) return false;

    const user: UserDocument = await this.userRepository.findUserById(
      command.userId,
    );

    let login = 'undefined';

    if (user) {
      login = user.accountData.login;
    }

    const postLike: PostLikeDocument = await this.likesRepository.findPostLike(
      command.postId,
      command.userId,
    );

    if (!postLike) {
      const postLike = this.PostLikeModel.createPostLike(
        command.postId,
        command.userId,
        command.createPostLikeDto,
        login,
        this.PostLikeModel,
      );

      await this.likesRepository.save(postLike);
      return true;
    }

    postLike.updatePostLikeStatus(command.createPostLikeDto);

    await this.likesRepository.save(postLike);

    return true;
  }
}