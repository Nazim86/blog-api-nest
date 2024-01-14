import { Injectable } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { join } from 'path';
import sharp from 'sharp';
import { BlogRepository } from '../api/infrastructure/blogs/blog.repository';
import { ResultCode } from '../exception-handler/result-code-enum';

@Injectable()
export class S3StorageAdapter {
  s3Client: S3Client;

  constructor(private readonly blogsRepo: BlogRepository) {
    const REGION = 'eu-north-1';
    this.s3Client = new S3Client({
      region: REGION,
      endpoint: 'https://s3.eu-north-1.amazonaws.com',
      credentials: {
        secretAccessKey: '2z5p+fFSKFkiOqGV3ZOxadRalIs1k2la9PGEKCU+',
        accessKeyId: 'AKIAUH7P3WMF6YYIQUMA',
      },
    });
  }
  async saveImage(imageBuffer: Buffer, userId: string, blogId: string) {
    const blog = await this.blogsRepo.getBlogById(blogId);

    if (blog.owner.id !== userId) {
      return { code: ResultCode.Forbidden };
    }

    const key = 'images/original-wallpaper.jpg';
    const command = new PutObjectCommand({
      Bucket: 'nazimych',
      Key: key,
      Body: imageBuffer,
      ContentType: 'image/jpeg',
      ACL: 'public-read',
    });
    await this.s3Client.send(command);

    const url = join('https://nazimych.s3.eu-north-1.amazonaws.com', key);

    const metadata = await sharp(imageBuffer).metadata();

    //console.log('metadata in adapte', metadata);

    return {
      wallpaper: {
        url: url,
        width: metadata.width,
        height: metadata.height,
        fileSize: metadata.size,
      },
      main: [
        {
          url: 'string',
          width: 0,
          height: 0,
          fileSize: 0,
        },
      ],
    };
  }
}
