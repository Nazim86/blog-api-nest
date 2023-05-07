import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './user.entity';
import { Model } from 'mongoose';
import { userMapping } from './user.mapping';

@Injectable()
export class UserQueryRepo {
  constructor(@InjectModel(User.name) private UserModel: Model<UserDocument>) {}
  async getUsers(
    sortBy: string,
    sortDirection: string,
    pageNumber: number,
    pageSize: number,
    searchLoginTerm: string,
    searchEmailTerm: string,
  ) {
    const skipSize = (pageNumber - 1) * pageSize;
    const filter = {
      $or: [
        {
          'accountData.login': { $regex: searchLoginTerm ?? '', $options: 'i' },
        },
        {
          'accountData.email': { $regex: searchEmailTerm ?? '', $options: 'i' },
        },
      ],
    };
    const totalCount = await this.UserModel.countDocuments(filter);
    const pagesCount = Math.ceil(totalCount / pageSize);

    const getUsers: UserDocument[] = await this.UserModel.find(filter)
      .sort({ [sortBy]: sortDirection === 'asc' ? 1 : -1 })
      .skip(skipSize)
      .limit(pageSize)
      .lean();

    const mappedUsers = userMapping(getUsers);

    return {
      pagesCount: pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: totalCount,
      items: mappedUsers,
    };
  }
}
