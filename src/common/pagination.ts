export class Pagination<T> {
  public readonly data: T[];
  public readonly pageSize: number;
  public readonly pageNumber: number;
  public readonly sortBy: string;
  public readonly sortDirection: 'asc' | 'desc';

  constructor(
    pageNumber = 1,
    pageSize = 10,
    sortBy = 'createdAt',
    sortDirection: 'asc' | 'desc' = 'desc',
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

  // public get sortedData(): T[] {
  //   const sorted = this.data.sort((a, b) => {
  //     const fieldA = a[this.sortBy];
  //     const fieldB = b[this.sortBy];
  //     const compare = fieldA < fieldB ? -1 : fieldA > fieldB ? 1 : 0;
  //     return this.sortDirection === 'asc' ? compare : -compare;
  //   });
  //
  //   return sorted.slice(this.startIndex, this.endIndex + 1);
  // }
}

export interface PaginationType {
  sortBy: string;
  sortDirection: string;
  pageNumber: number;
  pageSize: number;
}
