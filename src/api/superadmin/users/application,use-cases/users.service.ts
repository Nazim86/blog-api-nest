import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';

import { User, UserModelTYpe } from '../../../../domains/user.entity';

@Injectable()
export class UsersService {
  constructor(
    protected userRepository: UsersRepository,
    @InjectModel(User.name) private UserModel: UserModelTYpe,
  ) {}

  async deleteUser(id: string): Promise<boolean> {
    return await this.userRepository.deleteUser(id);
  }
}
