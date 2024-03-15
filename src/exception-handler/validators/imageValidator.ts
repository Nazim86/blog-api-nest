import { FileValidator } from '@nestjs/common';
import sharp from 'sharp';

interface ImageValidatorOptions {
  allowedExtensions: string[]; // Specify allowed file extensions
  maxSize: number; // Specify maximum file size in bytes
  width: number;
  height: number;
}

export class ImageValidator extends FileValidator<ImageValidatorOptions> {
  constructor(private options: ImageValidatorOptions) {
    super(options);
  }

  async isValid(file?: Express.Multer.File): Promise<boolean> {
    let metadata;

    try {
      metadata = await sharp(file.buffer).metadata();
    } catch (e) {
      console.log('error in catch in ImageValidator', e);
      return false;
    }

    return !(
      metadata.size > this.options.maxSize ||
      !this.options.allowedExtensions.includes(metadata.format) ||
      metadata.width !== this.options.width ||
      metadata.height !== this.options.height
    );
  }

  buildErrorMessage(): string {
    return 'Image width, height, max size or format is incorrect';
  }
}
