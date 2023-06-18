import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../../infrastructure/users/users.repository';

import { User, UserModelTYpe } from '../../../entities/user.entity';
import { BlogRepository } from '../../../infrastructure/blogs/blog.repository';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UsersRepository,
    private readonly blogsRepository: BlogRepository,
    @InjectModel(User.name) private UserModel: UserModelTYpe,
  ) {}

  async deleteUser(id: string): Promise<boolean> {
    const result = await this.userRepository.deleteUser(id);
    if (result) {
      const isDeleted = await this.blogsRepository.deleteBlogOwnerInfo(id);
      if (isDeleted) {
        return true;
      }
    }
  }
}
