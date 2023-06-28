import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../../entities/user.entity';
import { Model } from 'mongoose';

import { UserViewType } from './types/user-view-type';
import {
  BanStatusEnum,
  UserPagination,
} from '../../superadmin/users/user-pagination';
import { PaginationType } from '../../../common/pagination';
import { filterForUserQuery } from '../../../common/filterForUserQuery';
import {
  BloggerBanUser,
  BloggerBanUserDocument,
  BloggerBanUserModelType,
} from '../../entities/user-ban-by-blogger.entity';
import { RoleEnum } from '../../../enums/role-enum';
import { BlogRepository } from '../blogs/blog.repository';
import { ResultCode } from '../../../exception-handler/result-code-enum';
import { BlogDocument } from '../../entities/blog.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class UserQueryRepo {
  constructor(
    @InjectModel(User.name) private UserModel: Model<UserDocument>,
    @InjectModel(BloggerBanUser.name)
    private UserBanModel: BloggerBanUserModelType,
    private readonly blogsRepository: BlogRepository,
    @InjectDataSource() protected dataSource: DataSource,
  ) {}

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

  private bannedUserMappingForBlog = (
    bannedUsers: BloggerBanUserDocument[],
  ) => {
    return bannedUsers.map((bannedUser: BloggerBanUserDocument) => {
      return {
        id: bannedUser.userId,
        login: bannedUser.login,
        banInfo: {
          isBanned: bannedUser.banInfo.isBanned,
          banDate: bannedUser.banInfo.banDate,
          banReason: bannedUser.banInfo.banReason,
        },
      };
    });
  };

  async getBannedUsersForBlog(
    userId: string,
    query: UserPagination<PaginationType>,
    blogId: string,
  ) {
    const paginatedQuery: UserPagination<PaginationType> =
      new UserPagination<PaginationType>(
        query.pageNumber,
        query.pageSize,
        query.sortBy,
        query.sortDirection,
        query.searchLoginTerm,
      );
    const filter = filterForUserQuery(
      paginatedQuery.searchLoginTerm,
      null,
      BanStatusEnum.banned,
      RoleEnum.Blogger,
    );

    const blog: BlogDocument | null = await this.blogsRepository.getBlogById(
      blogId,
    );

    if (!blog) return { code: ResultCode.NotFound };

    if (blog.blogOwnerInfo.userId !== userId)
      return { code: ResultCode.Forbidden };

    filter.$and.push({ 'banInfo.blogId': blogId });

    const skipSize = paginatedQuery.skipSize; //(paginatedQuery.pageNumber - 1) * paginatedQuery.pageSize;
    const totalCount = await this.UserBanModel.countDocuments(filter);

    const pagesCount = paginatedQuery.totalPages(totalCount); //Math.ceil(totalCount / paginatedQuery.pageSize);

    const sortDirection = paginatedQuery.sortDirection === 'asc' ? 1 : -1;

    const bannedUsersForBlog: BloggerBanUserDocument[] =
      await this.UserBanModel.find(filter)
        .sort({
          [paginatedQuery.sortBy]: sortDirection,
        })
        .skip(skipSize)
        .limit(paginatedQuery.pageSize)
        .lean();

    const mappedBannedUsers = this.bannedUserMappingForBlog(bannedUsersForBlog);

    return {
      data: {
        pagesCount: pagesCount,
        page: Number(paginatedQuery.pageNumber),
        pageSize: Number(paginatedQuery.pageSize),
        totalCount: totalCount,
        items: mappedBannedUsers,
      },
      code: ResultCode.Success,
    };
  }

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

    const filter = filterForUserQuery(
      paginatedQuery.searchLoginTerm,
      paginatedQuery.searchEmailTerm,
      paginatedQuery.banStatus,
    );

    const skipSize = paginatedQuery.skipSize; //(paginatedQuery.pageNumber - 1) * paginatedQuery.pageSize;

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
    const user = await this.dataSource.query(
      `SELECT u.*, ub."banDate", ub."banReason" FROM public.users u left join public.users_ban_by_sa ub on u."id" = ub."userId" where u."id"=$1;`,
      [id],
    );
    return {
      id: user[0].id,
      login: user[0].login,
      email: user[0].email,
      createdAt: user[0].createdAt,
      banInfo: {
        isBanned: user[0].isBanned,
        banDate: user[0].banDate,
        banReason: user[0].banReason,
      },
    };
  }
}
