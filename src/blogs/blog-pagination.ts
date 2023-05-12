import { Pagination } from '../common/pagination';

export class BlogPagination<T> extends Pagination<T> {
  public readonly searchNameTerm: string;

  constructor(
    pageNumber = 1,
    pageSize = 10,
    sortBy = 'createdAt',
    sortDirection: 'asc' | 'desc' = 'desc',
    searchNameTerm: string,
  ) {
    super(pageNumber, pageSize, sortBy, sortDirection);
    this.searchNameTerm = searchNameTerm;
  }
}
