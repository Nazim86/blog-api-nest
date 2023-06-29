import { CommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../infrastructure/users/users.repository';
import { BlogRepository } from '../../../infrastructure/blogs/blog.repository';

export class DeleteUserCommand {
  constructor(public userId: string) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly blogsRepository: BlogRepository,
  ) {}
  async execute(command: DeleteUserCommand): Promise<boolean> {
    const result = await this.usersRepository.deleteUser(command.userId);
    if (result) {
      const isDeleted = await this.blogsRepository.deleteBlogOwnerInfo(
        command.userId,
      );
      if (isDeleted) {
        return true;
      }
    }
  }
}
