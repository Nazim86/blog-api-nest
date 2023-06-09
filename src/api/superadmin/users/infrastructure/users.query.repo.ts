import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../../../domains/user.entity';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { UserViewType } from './types/user-view-type';
import { BanStatusEnum, UserPagination } from '../user-pagination';
import { PaginationType } from '../../../../common/pagination';

@Injectable()
export class UserQueryRepo {
  constructor(@InjectModel(User.name) private UserModel: Model<UserDocument>) {}

  private userMapping = (newUser: UserDocument[]): UserViewType[] => {
    return newUser.map((user: UserDocument): UserViewType => {
      return {
        id: user._id.toString(),
        login: user.accountData.login,
        email: user.accountData.email,
        createdAt: user.accountData.createdAt,
      };
    });
  };

  private userMappingForSA = (newUser: UserDocument[]): UserViewType[] => {
    return newUser.map((user: UserDocument): UserViewType => {
      return {
        id: user._id.toString(),
        login: user.accountData.login,
        email: user.accountData.email,
        createdAt: user.accountData.createdAt,
        banInfo: {
          isBanned: user.banInfo.isBanned,
          banDate: user.banInfo.banDate,
          banReason: user.banInfo.banReason,
        },
      };
    });
  };

  async getUsers(query: UserPagination<PaginationType>, requestType?: string) {
    const paginatedQuery = new UserPagination<PaginationType>(
      query.pageNumber,
      query.pageSize,
      query.sortBy,
      query.sortDirection,
      query.searchLoginTerm,
      query.searchEmailTerm,
      query.banStatus,
    );

    const skipSize = paginatedQuery.skipSize; //(paginatedQuery.pageNumber - 1) * paginatedQuery.pageSize;

    const filter: any = {};
    filter.$and = [];

    if (paginatedQuery.searchLoginTerm || paginatedQuery.searchEmailTerm) {
      filter.$or = [];
    }

    if (paginatedQuery.banStatus === BanStatusEnum.banned) {
      filter.$and.push({ 'banInfo.isBanned': true });
    }

    if (paginatedQuery.banStatus === BanStatusEnum.notBanned) {
      filter.$and.push({ 'banInfo.isBanned': false });
    }

    if (paginatedQuery.searchLoginTerm) {
      filter.$or.push({
        'accountData.login': {
          $regex: paginatedQuery.searchLoginTerm ?? '',
          $options: 'i',
        },
      });
    }

    if (paginatedQuery.searchEmailTerm) {
      filter.$or.push({
        'accountData.email': {
          $regex: paginatedQuery.searchEmailTerm ?? '',
          $options: 'i',
        },
      });
    }

    if (filter.$or && filter.$or.length > 0) {
      filter.$and.push({ $or: filter.$or });
      delete filter.$or;
    }

    if (filter.$and.length === 0) {
      delete filter.$and;
    }

    const totalCount = await this.UserModel.countDocuments(filter);
    const pagesCount = paginatedQuery.totalPages(totalCount); //Math.ceil(totalCount / paginatedQuery.pageSize);

    const sortDirection = paginatedQuery.sortDirection === 'asc' ? 1 : -1;

    const getUsers: UserDocument[] = await this.UserModel.find(filter)
      .sort({
        [`accountData.${paginatedQuery.sortBy}`]: sortDirection,
      })
      .skip(skipSize)
      .limit(paginatedQuery.pageSize)
      .lean();

    let mappedUsers: any[];

    if (requestType === 'SA') {
      mappedUsers = this.userMappingForSA(getUsers);
    } else {
      mappedUsers = this.userMapping(getUsers);
    }

    return {
      pagesCount: pagesCount,
      page: Number(paginatedQuery.pageNumber),
      pageSize: Number(paginatedQuery.pageSize),
      totalCount: totalCount,
      items: mappedUsers,
    };
  }

  async getUserById(id: string): Promise<UserViewType> {
    const user = await this.UserModel.findOne({ _id: new ObjectId(id) });
    return {
      id: user.id,
      login: user.accountData.login,
      email: user.accountData.email,
      createdAt: user.accountData.createdAt,
      banInfo: {
        isBanned: user.banInfo.isBanned,
        banDate: user.banInfo.banDate,
        banReason: user.banInfo.banReason,
      },
    };
  }
}
