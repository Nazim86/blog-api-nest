import { CommandHandler } from '@nestjs/cqrs';
import { PostDocument } from '../../../../domains/post.entity';
import { UserDocument } from '../../../../domains/user.entity';
import {
  Comment,
  CommentDocument,
  CommentModelType,
} from '../../../../domains/comment.entity';
import { PostRepository } from '../../post/infrastructure/post.repository';
import { UsersRepository } from '../../../superadmin/users/infrastructure/users.repository';
import { InjectModel } from '@nestjs/mongoose';
import { CommentsRepository } from '../infrastructure/comments.repository';

export class CommentCreateCommand {
  constructor(public createCommentDto, public postId, public userId) {}
}

@CommandHandler(CommentCreateCommand)
export class CommentCreateUseCase {
  constructor(
    private readonly postsRepository: PostRepository,
    private readonly usersRepository: UsersRepository,
    private readonly commentsRepository: CommentsRepository,
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
  ) {}
  async execute(command: CommentCreateCommand): Promise<string | null> {
    const postById: PostDocument | boolean =
      await this.postsRepository.getPostById(command.postId);

    if (!postById || typeof postById === 'boolean') return null;

    const user: UserDocument | null = await this.usersRepository.findUserById(
      command.userId,
    );

    if (!user) return null;

    const newComment: CommentDocument = this.CommentModel.createComment(
      command.createCommentDto,
      command.postId,
      command.userId,
      user.accountData.login,
      this.CommentModel,
    );

    await this.commentsRepository.save(newComment);
    return newComment.id;
  }
}
