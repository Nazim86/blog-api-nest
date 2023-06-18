import { CommandHandler } from '@nestjs/cqrs';
import { PostDocument } from '../../../entities/post.entity';
import { UserDocument } from '../../../entities/user.entity';
import {
  Comment,
  CommentDocument,
  CommentModelType,
} from '../../../entities/comment.entity';
import { PostRepository } from '../../../infrastructure/posts/post.repository';
import { UsersRepository } from '../../../infrastructure/users/users.repository';
import { InjectModel } from '@nestjs/mongoose';
import { CommentsRepository } from '../../../infrastructure/comments/comments.repository';

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
    const post: PostDocument | boolean = await this.postsRepository.getPostById(
      command.postId,
    );

    if (!post || typeof post === 'boolean') return null;

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
      post.title,
      post.blogId,
      post.blogName,
    );

    await this.commentsRepository.save(newComment);
    return newComment.id;
  }
}
