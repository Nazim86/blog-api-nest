import { CommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../infrastructure/users/users.repository';

export class DeleteUserCommand {
  constructor(public userId: string) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}
  async execute(command: DeleteUserCommand): Promise<boolean> {
    const isUserDeleted = await this.usersRepository.deleteUser(command.userId);
    if (!isUserDeleted) return false;

    // await this.blogsRepository.deleteBlogOwnerInfo(command.userId);

    //if (!isBlogOwnerDeleted) return false;

    return true;
  }
}
