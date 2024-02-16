import { Injectable } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

@Injectable()
export class S3StorageAdapter {
  s3Client: S3Client;

  constructor() {
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

  async saveImage(imageBuffer: Buffer, key: string) {
    const command = new PutObjectCommand({
      Bucket: 'nazimych',
      Key: key,
      Body: imageBuffer,
      ContentType: 'image/jpeg',
      ACL: 'public-read',
    });
    return this.s3Client.send(command);
  }
}
