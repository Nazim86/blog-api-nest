import { Pagination, PaginationType } from '../common/pagination';

export class UserPagination<T> extends Pagination<PaginationType> {
  public readonly searchLoginTerm: string;
  public readonly searchEmailTerm: string;

  constructor(
    pageNumber = 1,
    pageSize = 10,
    sortBy = 'createdAt',
    sortDirection: 'asc' | 'desc' = 'desc',
    searchLoginTerm: string = null,
    searchEmailTerm: string = null,
  ) {
    super(pageNumber, pageSize, sortBy, sortDirection);
    this.searchLoginTerm = searchLoginTerm;
    this.searchEmailTerm = searchEmailTerm;
  }
}
