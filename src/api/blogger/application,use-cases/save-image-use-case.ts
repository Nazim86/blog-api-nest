import { CommandHandler } from '@nestjs/cqrs';
import { S3StorageAdapter } from '../../../common/s3-storage-adapter';

export class SaveImageCommand {
  constructor(
    public imageBuffer: Buffer,
    public userId: string,
    public blogId: string,
  ) {}
}

@CommandHandler(SaveImageCommand)
export class SaveImageUseCase {
  constructor(private readonly s3StorageAdapter: S3StorageAdapter) {}
  async execute(command: SaveImageCommand) {
    return await this.s3StorageAdapter.saveImage(
      command.imageBuffer,
      command.userId,
      command.blogId,
    );
    //{ code: isImageSaved ? ResultCode.Success : ResultCode.BadRequest };
  }
}
