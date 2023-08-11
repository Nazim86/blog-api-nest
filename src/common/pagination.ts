import { SortDirection } from '../enums/sort-direction.enum';

export class Pagination<T> {
  public readonly data: T[];
  public readonly pageSize: number;
  public readonly pageNumber: number;
  public readonly sortBy: string;
  public readonly sortDirection: SortDirection;

  constructor(
    pageNumber = 1,
    pageSize = 10,
    sortBy = 'createdAt',
    sortDirection: SortDirection = SortDirection.DESC,
  ) {
    this.pageNumber = pageNumber;
    this.pageSize = pageSize;
    this.sortBy = sortBy;
    this.sortDirection = sortDirection;
  }

  public totalPages(totalCount): number {
    return Math.ceil(totalCount / this.pageSize);
  }

  public get skipSize(): number {
    return (this.pageNumber - 1) * this.pageSize;
  }
}

export interface PaginationType {
  sortBy: string;
  sortDirection: SortDirection;
  pageNumber: number;
  pageSize: number;
}
