import { CommandHandler } from '@nestjs/cqrs';
import { S3StorageAdapter } from '../../../common/s3-storage-adapter';
import { ResultCode } from '../../../exception-handler/result-code-enum';
import { BlogRepository } from '../../infrastructure/blogs/blog.repository';
import sharp from 'sharp';
import { join } from 'path';
import { BlogWallpaperImage } from '../../entities/blogs/blogWallpaperImage.entity';

export class BlogWallpaperImageCommand {
  constructor(
    public imageBuffer: Buffer,
    public userId: string,
    public blogId: string,
    public filename: string,
  ) {}
}

@CommandHandler(BlogWallpaperImageCommand)
export class BlogWallpaperImageUseCase {
  constructor(
    private readonly s3StorageAdapter: S3StorageAdapter,
    private readonly blogsRepo: BlogRepository,
  ) {}
  async execute(command: BlogWallpaperImageCommand) {
    const blog = await this.blogsRepo.getBlogById(command.blogId);

    if (blog.owner.id !== command.userId) {
      return { code: ResultCode.Forbidden };
    }

    const metadata = await sharp(command.imageBuffer.buffer).metadata();

    const key = `blog/images/wallpaper/${blog.id}_${command.filename}`;

    await this.s3StorageAdapter.saveImage(command.imageBuffer, key);

    const url = join('https://nazimych.s3.eu-north-1.amazonaws.com', key);

    let blogWallpaperData = await this.blogsRepo.findWallpaper(command.blogId);

    if (!blogWallpaperData) {
      blogWallpaperData = new BlogWallpaperImage();
    }

    blogWallpaperData.url = url;
    blogWallpaperData.height = metadata.height;
    blogWallpaperData.width = metadata.width;
    blogWallpaperData.fileSize = metadata.size;
    blogWallpaperData.blogs = blog;

    return this.blogsRepo.saveWallpaperData(blogWallpaperData);

    // return {
    //   url: url,
    //   width: metadata.width,
    //   height: metadata.height,
    //   fileSize: metadata.size,
    // };
  }
}
