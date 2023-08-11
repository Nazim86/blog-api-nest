import { Pagination, PaginationType } from '../../../common/pagination';
import { SortDirection } from '../../../enums/sort-direction.enum';

export class BlogPagination<T> extends Pagination<PaginationType> {
  public readonly searchNameTerm: string;

  constructor(
    pageNumber = 1,
    pageSize = 10,
    sortBy = 'createdAt',
    sortDirection: SortDirection = SortDirection.DESC,
    searchNameTerm: string,
  ) {
    super(pageNumber, pageSize, sortBy, sortDirection);
    this.searchNameTerm = searchNameTerm;
  }
}
