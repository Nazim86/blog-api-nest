import { Injectable } from '@nestjs/common';
import { UserViewType } from './types/user-view-type';
import { UserPagination } from '../../superadmin/users/user-pagination';
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
        // banInfo: {
        //   isBanned: user.banInfo.isBanned,
        //   banDate: user.banInfo.banDate,
        //   banReason: user.banInfo.banReason,
        // },
      };
    });
  };

  private bannedUserMappingForBlog = (users) => {
    return users.map((user) => {
      return {
        id: user.id,
        login: user.login,
        banInfo: {
          isBanned: user.usersBanByBlogger.isBanned,
          banDate: user.usersBanByBlogger.banDate,
          banReason: user.usersBanByBlogger.banReason,
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

    let searchlogin = '';

    if (paginatedQuery.searchLoginTerm) {
      searchlogin = paginatedQuery.searchLoginTerm;
    }

    const blog = await this.blogsRepository.getBlogById(blogId);

    if (!blog) return { code: ResultCode.NotFound };

    if (blog.owner.id !== userId) return { code: ResultCode.Forbidden };

    const skipSize = paginatedQuery.skipSize;

    const bannedUsersForBlog = await this.usersRepository
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.usersBanByBlogger', 'ubb')
      .leftJoinAndSelect('ubb.blog', 'b')
      .where('ubb.isBanned = true')
      .andWhere(`u.login ilike :login`, {
        login: `%${searchlogin}%`,
      })
      .andWhere('b.id = :blogId', { blogId: blogId })
      .orderBy(`u.${paginatedQuery.sortBy}`, paginatedQuery.sortDirection)
      .skip(skipSize)
      .take(paginatedQuery.pageSize)
      .getManyAndCount();

    const totalCount = Number(bannedUsersForBlog[1]);

    const pagesCount = paginatedQuery.totalPages(totalCount); //Math.ceil(totalCount / paginatedQuery.pageSize);

    const mappedBannedUsers = this.bannedUserMappingForBlog(
      bannedUsersForBlog[0],
    );

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

    const getUsers = await this.usersRepository
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.banInfo', 'ub', 'u.id=ub.userId')
      .where(
        `${
          filter.banStatus01 === true || filter.banStatus01 === false
            ? 'ub.isBanned = :banStatus'
            : 'ub.isBanned is not null'
        }`,
        {
          banStatus: filter.banStatus01,
        },
      )
      .andWhere(
        `(u.login ilike :loginTerm OR u.email ilike :emailTerm)`,

        {
          loginTerm: `%${filter.searchLogin}%`,
          emailTerm: `%${filter.searchEmail}%`,
        },
      )
      .orderBy(`u.${paginatedQuery.sortBy}`, paginatedQuery.sortDirection)
      .skip(skipSize)
      .take(paginatedQuery.pageSize)
      .getManyAndCount();

    //console.log(getUsers[0]);

    const totalCount = Number(getUsers[1]);

    const pagesCount = paginatedQuery.totalPages(totalCount);

    let mappedUsers: any[];

    if (requestType === RoleEnum.SA) {
      mappedUsers = this.userMappingForSA(getUsers[0]);
      //console.log('mapped Users', mappedUsers);
    } else {
      mappedUsers = this.userMapping(getUsers[0]);
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

    // console.log(user);

    return {
      id: user.id,
      login: user.login,
      email: user.email,
      createdAt: user.createdAt,
      // banInfo: {
      //   isBanned: user.banInfo.isBanned,
      //   banDate: user.banInfo.banDate,
      //   banReason: user.banInfo.banReason,
      // },
    };
  }
}
