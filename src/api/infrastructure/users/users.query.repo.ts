import { Injectable } from '@nestjs/common';
import { UserViewType } from './types/user-view-type';
import {
  BanStatusEnum,
  UserPagination,
} from '../../superadmin/users/user-pagination';
import { PaginationType } from '../../../common/pagination';
import { filterForUserQuery } from '../../../common/filterForUserQuery';
import { RoleEnum } from '../../../enums/role-enum';
import { BlogRepository } from '../blogs/blog.repository';
import { ResultCode } from '../../../exception-handler/result-code-enum';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Users } from '../../entities/users/user.entity';

@Injectable()
export class UserQueryRepo {
  constructor(
    private readonly blogsRepository: BlogRepository,
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
  ) {}

  private userMapping = (newUser): UserViewType[] => {
    return newUser.map((user): UserViewType => {
      return {
        id: user.id,
        login: user.login,
        email: user.email,
        createdAt: user.createdAt,
      };
    });
  };

  private userMappingForSA = (newUser): UserViewType[] => {
    return newUser.map((user): UserViewType => {
      return {
        id: user.id,
        login: user.login,
        email: user.email,
        createdAt: user.createdAt,
        banInfo: {
          isBanned: user.banInfo.isBanned,
          banDate: user.banInfo.banDate,
          banReason: user.banInfo.banReason,
        },
      };
    });
  };

  private bannedUserMappingForBlog = (bannedUsers) => {
    return bannedUsers.map((bannedUser) => {
      return {
        id: bannedUser.id,
        login: bannedUser.login,
        banInfo: {
          isBanned: bannedUser.isBanned,
          banDate: bannedUser.banDate,
          banReason: bannedUser.banReason,
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

    const blog = await this.blogsRepository.getBlogById(blogId);

    if (!blog) return { code: ResultCode.NotFound };

    if (blog.ownerId !== userId) return { code: ResultCode.Forbidden };

    //filter.$and.push({ 'banInfo.blogId': blogId });

    const skipSize = paginatedQuery.skipSize;

    let totalCount = await this.dataSource.query(
      `SELECT COUNT(*)
    FROM public.users_ban_by_blogger ubb
    Left join public.users u on
    u."id" = ubb."userId"
    WHERE u."login" ilike $1 and ubb."blogId" = $2  And (ubb."isBanned"=$3 or ubb."isBanned"=$4);`,
      [filter.searchLogin, blogId, filter.banStatus01, filter.banStatus02],
    );

    totalCount = Number(totalCount[0].count);
    //const totalCount = await this.UserBanModel.countDocuments(filter);

    const pagesCount = paginatedQuery.totalPages(totalCount); //Math.ceil(totalCount / paginatedQuery.pageSize);

    //const sortDirection = paginatedQuery.sortDirection === 'asc' ? 1 : -1;

    const bannedUsersForBlog = await this.dataSource.query(
      `SELECT  u."id",u.login,u.email,ubb."isBanned",ubb."banDate", ubb."banReason"
    FROM public.users u
    Left join public.users_ban_by_blogger ubb on u."id" = ubb."userId"
    WHERE u."login" ilike $1 and ubb."blogId" = $2  And (ubb."isBanned"=$3 or ubb."isBanned"=$4)
    Order by "${paginatedQuery.sortBy}" ${paginatedQuery.sortDirection}
    Limit ${paginatedQuery.pageSize} Offset ${skipSize};`,
      [filter.searchLogin, blogId, filter.banStatus01, filter.banStatus02],
    );

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

    const skipSize = paginatedQuery.skipSize;

    const totalCount = await this.usersRepository
      .createQueryBuilder('u')
      .leftJoin('u.banInfo', 'ub', 'u.id=ub.userId')
      .where(
        '(u.login ilike :login or u.email ilike :email) and ' +
          '(ub.isBanned = :banStatus01 or ub.isBanned = :banStatus02 )',
        {
          login: filter.searchLogin,
          email: filter.searchEmail,
          banStatus01: filter.banStatus01,
          banStatus02: filter.banStatus02,
        },
      )
      .getCount();

    const pagesCount = paginatedQuery.totalPages(totalCount); //Math.ceil(totalCount / paginatedQuery.pageSize);

    const getUsers = await this.usersRepository
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.banInfo', 'ub', 'u.id=ub.userId')

      .where(
        '(u.login ilike :login or u.email ilike :email) and ' +
          '(ub.isBanned = :banStatus01 or ub.isBanned = :banStatus02 )',
        {
          login: filter.searchLogin,
          email: filter.searchEmail,
          banStatus01: filter.banStatus01,
          banStatus02: filter.banStatus02,
        },
      )
      .orderBy(`u.${paginatedQuery.sortBy}`, paginatedQuery.sortDirection)
      .skip(skipSize)
      .take(paginatedQuery.pageSize)
      .getMany();

    let mappedUsers: any[];

    if (requestType === RoleEnum.SA) {
      mappedUsers = this.userMappingForSA(getUsers);
      //console.log('mapped Users', mappedUsers);
    } else {
      mappedUsers = this.userMapping(getUsers);
    }

    return {
      pagesCount: pagesCount,
      page: Number(paginatedQuery.pageNumber),
      pageSize: Number(paginatedQuery.pageSize),
      totalCount: Number(totalCount),
      items: mappedUsers,
    };
  }

  async getUserById(id: string): Promise<UserViewType> {
    const user = await this.usersRepository
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.banInfo', 'ubbs')
      .where('u.id=:id', { id })
      .getOne();

    return {
      id: user.id,
      login: user.login,
      email: user.email,
      createdAt: user.createdAt,
      banInfo: {
        isBanned: user.banInfo.isBanned,
        banDate: user.banInfo.banDate,
        banReason: user.banInfo.banReason,
      },
    };
  }
}
