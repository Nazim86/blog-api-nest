// import { Injectable } from '@nestjs/common';
// import { BlogRepository } from '../../../blogs/infrastructure/blog.repository';
//
// import { InjectModel } from '@nestjs/mongoose';
// import {
//   Blog,
//   BlogDocument,
//   BlogModelType,
// } from '../../../blogs/domain/blog.entity';
// import { UserDocument } from "../../superadmin/users/domain/user.entity";
//
// @Injectable()
// export class BlogService {
//   constructor(
//     protected blogRepository: BlogRepository,
//     @InjectModel(Blog.name) private BlogModel: BlogModelType,
//   ) {}
//
//   async deleteBlogById(userId: string, blogId: string): Promise<boolean> {
//     const blog: BlogDocument = await this.blogRepository.getBlogById(blogId);
//     const user:UserDocument = await this.
//     return await this.blogRepository.deleteBlogById(userId, blogId);
//   }
// }
