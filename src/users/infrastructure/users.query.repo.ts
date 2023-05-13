import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../domain/user.entity';
import { Model } from 'mongoose';
import { userMapping } from '../user.mapping';

@Injectable()
export class UserQueryRepo {
  constructor(@InjectModel(User.name) private UserModel: Model<UserDocument>) {}
  async getUsers(paginatedQuery) {
    const skipSize = (paginatedQuery.pageNumber - 1) * paginatedQuery.pageSize;
    const filter = {
      $or: [
        {
          'accountData.login': {
            $regex: paginatedQuery.searchLoginTerm ?? '',
            $options: 'i',
          },
        },
        {
          'accountData.email': {
            $regex: paginatedQuery.searchEmailTerm ?? '',
            $options: 'i',
          },
        },
      ],
    };
    const totalCount = await this.UserModel.countDocuments(filter);
    const pagesCount = Math.ceil(totalCount / paginatedQuery.pageSize);

    const getUsers: UserDocument[] = await this.UserModel.find(filter)
      .sort({
        [paginatedQuery.sortBy]:
          paginatedQuery.sortDirection === 'asc' ? 1 : -1,
      })
      .skip(skipSize)
      .limit(paginatedQuery.pageSize)
      .lean();

    const mappedUsers = userMapping(getUsers);

    return {
      pagesCount: pagesCount,
      page: paginatedQuery.pageNumber,
      pageSize: paginatedQuery.pageSize,
      totalCount: totalCount,
      items: mappedUsers,
    };
  }
}
