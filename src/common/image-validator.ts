// import {
//   BadRequestException,
//   Injectable,
//   PipeTransform,
//   ValidationPipe,
// } from '@nestjs/common';
//
// import sharp from 'sharp';
//
//
// @Injectable()
// export class ImageValidator
//
// {
//   async validateImage(image: Express.Multer.File): Promise<string> {
//     // const originalName = path.parse(image.originalname).name;
//     // const filename = Date.now() + '-' + originalName + '.webp';
//     //
//     // await sharp(image.buffer)
//     //   .resize(800)
//     //   .webp({ effort: 3 })
//     //   .toFile(path.join('uploads', filename));
//     // sharp().jpeg();
//     //
//     // return filename;
//     try {
//       const metadata = await sharp(image.buffer).metadata();
//       console.log(metadata);
//     } catch (e) {}
//   }
// }
