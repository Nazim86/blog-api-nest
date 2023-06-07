import { Pagination, PaginationType } from '../../../common/pagination';

export enum BanStatusEnum {
  all = 'all',
  banned = 'banned',
  notBanned = 'notBanned',
}

export class UserPagination<T> extends Pagination<PaginationType> {
  public readonly searchLoginTerm: string;
  public readonly searchEmailTerm: string;
  public readonly banStatus: BanStatusEnum;

  constructor(
    pageNumber = 1,
    pageSize = 10,
    sortBy = 'createdAt',
    sortDirection: 'asc' | 'desc' = 'desc',
    searchLoginTerm: string,
    searchEmailTerm: string,
    banStatus = BanStatusEnum.all,
  ) {
    super(pageNumber, pageSize, sortBy, sortDirection);
    this.searchLoginTerm = searchLoginTerm;
    this.searchEmailTerm = searchEmailTerm;
    this.banStatus = banStatus;
  }
}
