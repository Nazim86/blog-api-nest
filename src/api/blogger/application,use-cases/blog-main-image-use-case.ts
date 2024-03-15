import { CommandHandler } from '@nestjs/cqrs';
import { S3StorageAdapter } from '../../../common/s3-storage-adapter';
import { ResultCode } from '../../../exception-handler/result-code-enum';
import { BlogRepository } from '../../infrastructure/blogs/blog.repository';
import sharp from 'sharp';
import { BlogMainImage } from '../../entities/blogs/blogMainImage.entity';

export class BlogMainImageCommand {
  constructor(
    public imageBuffer: Buffer,
    public userId: string,
    public blogId: string,
    public filename: string,
  ) {}
}

@CommandHandler(BlogMainImageCommand)
export class BlogMainImageUseCase {
  constructor(
    private readonly s3StorageAdapter: S3StorageAdapter,
    private readonly blogsRepo: BlogRepository,
  ) {}
  async execute(command: BlogMainImageCommand) {
    const blog = await this.blogsRepo.getBlogById(command.blogId);

    if (blog.owner.id !== command.userId) {
      return { code: ResultCode.Forbidden };
    }

    const metadata = await sharp(command.imageBuffer.buffer).metadata();

    const key = `blog/main/${blog.id}_${command.filename}`;

    await this.s3StorageAdapter.saveImage(command.imageBuffer, key);

    const url = 'https://nazimych.s3.eu-north-1.amazonaws.com/' + key;

    const blogMainImages: BlogMainImage[] = await this.blogsRepo.findImages(
      command.blogId,
    );

    let blogMainImage;

    if (!blogMainImages.length) {
      blogMainImage = new BlogMainImage();
    }

    blogMainImage.url = url;
    blogMainImage.height = metadata.height;
    blogMainImage.width = metadata.width;
    blogMainImage.fileSize = metadata.size;
    blogMainImage.blogs = blog;

    return this.blogsRepo.saveMainImage(blogMainImage);
  }
}
