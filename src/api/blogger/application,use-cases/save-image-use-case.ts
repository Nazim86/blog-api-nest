import { CommandHandler } from '@nestjs/cqrs';
import { S3StorageAdapter } from '../../../common/s3-storage-adapter';
import { ResultCode } from '../../../exception-handler/result-code-enum';
import { BlogRepository } from '../../infrastructure/blogs/blog.repository';

export class SaveImageCommand {
  constructor(
    public imageBuffer: Buffer,
    public userId: string,
    public blogId: string,
  ) {}
}

@CommandHandler(SaveImageCommand)
export class SaveImageUseCase {
  constructor(
    private readonly s3StorageAdapter: S3StorageAdapter,
    private readonly blogsRepo: BlogRepository,
  ) {}
  async execute(command: SaveImageCommand) {
    const blog = await this.blogsRepo.getBlogById(command.blogId);

    if (blog.owner.id !== command.userId) {
      return { code: ResultCode.Forbidden };
    }

    await this.s3StorageAdapter.saveImage(command.imageBuffer);

    //{ code: isImageSaved ? ResultCode.Success : ResultCode.BadRequest };
  }
}
