import { CommandHandler } from '@nestjs/cqrs';
import { S3StorageAdapter } from '../../../common/s3-storage-adapter';
import { ResultCode } from '../../../exception-handler/result-code-enum';
import { BlogRepository } from '../../infrastructure/blogs/blog.repository';
import sharp from 'sharp';
import { PostRepository } from '../../infrastructure/posts/post.repository';
import { PostMainImage } from '../../entities/posts/postMainImage.entity';

export class PostMainImageCommand {
  constructor(
    public imageBuffer: Buffer,
    public userId: string,
    public blogId: string,
    public postId: string,
    public filename: string,
  ) {}
}

@CommandHandler(PostMainImageCommand)
export class PostMainImageUseCase {
  constructor(
    private readonly s3StorageAdapter: S3StorageAdapter,
    private readonly blogsRepo: BlogRepository,
    private readonly postsRepo: PostRepository,
  ) {}
  async execute(command: PostMainImageCommand) {
    const blog = await this.blogsRepo.getBlogById(command.blogId);

    if (!blog) {
      return { code: ResultCode.NotFound };
    }

    if (blog.owner.id !== command.userId || blog.post.id !== command.postId) {
      return { code: ResultCode.Forbidden };
    }

    const post = await this.postsRepo.getPostById(command.postId);

    if (!post) return { code: ResultCode.NotFound };

    const originalSizeKey = `blog/post/main/${blog.id}_${post.id}_${command.filename}_original`;
    const middleSizeKey = `blog/post/main/${blog.id}_${post.id}_${command.filename}_middle`;
    const smallSizeKey = `blog/post/main/${blog.id}_${post.id}_${command.filename}_small`;

    const originalImageSize = command.imageBuffer;
    const middleImageSize = await sharp(originalImageSize.buffer)
      .resize({ width: 300, height: 180 })
      .toBuffer();
    const smallImageSize = await sharp(originalImageSize.buffer)
      .resize({ width: 149, height: 96 })
      .toBuffer();

    const originalMetadata = await sharp(originalImageSize.buffer).metadata();
    const middleMetadata = await sharp(middleImageSize.buffer).metadata();
    const smallMetadata = await sharp(smallImageSize.buffer).metadata();

    const originalSizeSave = this.s3StorageAdapter.saveImage(
      originalImageSize,
      originalSizeKey,
    );
    const middleSizeSave = this.s3StorageAdapter.saveImage(
      middleImageSize,
      middleSizeKey,
    );

    const smallSizeSave = this.s3StorageAdapter.saveImage(
      smallImageSize,
      smallSizeKey,
    );

    await Promise.all([smallSizeSave, middleSizeSave, originalSizeSave]);

    //await this.s3StorageAdapter.saveImage(command.imageBuffer, key);

    const originalImage = new PostMainImage();
    originalImage.url =
      'https://nazimych.s3.eu-north-1.amazonaws.com/' + originalSizeKey;
    originalImage.height = originalMetadata.height;
    originalImage.width = originalMetadata.width;
    originalImage.fileSize = originalMetadata.size;
    originalImage.post = post;

    await this.postsRepo.saveMainImage(originalImage);

    const middleImage = new PostMainImage();
    middleImage.url =
      'https://nazimych.s3.eu-north-1.amazonaws.com/' + middleSizeKey;
    middleImage.height = middleMetadata.height;
    middleImage.width = middleMetadata.width;
    middleImage.fileSize = middleMetadata.size;
    middleImage.post = post;

    await this.postsRepo.saveMainImage(middleImage);

    const smallImage = new PostMainImage();
    smallImage.url =
      'https://nazimych.s3.eu-north-1.amazonaws.com/' + smallSizeKey;
    smallImage.height = smallMetadata.height;
    smallImage.width = smallMetadata.width;
    smallImage.fileSize = smallMetadata.size;
    smallImage.post = post;

    const savedImage = await this.postsRepo.saveMainImage(smallImage);

    return {
      code: ResultCode.Success,
      data: savedImage,
    };
  }
}
