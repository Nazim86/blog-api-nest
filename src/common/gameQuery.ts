import { Pagination, PaginationType } from './pagination';
import { SortDirection } from '../enums/sort-direction.enum';

export class GameQuery extends Pagination<PaginationType> {
  constructor(
    public pageNumber: number = 1,
    public readonly pageSize: number = 10,
    public readonly sortBy: string = 'pairCreatedDate',
    public readonly sortDirection: SortDirection = SortDirection.DESC,
  ) {
    super(pageNumber, pageSize, sortDirection);
    this.sortBy = sortBy;
    if (
      sortDirection === SortDirection.ASC ||
      sortDirection === SortDirection.ASC.toLowerCase()
    ) {
      this.sortDirection = SortDirection.ASC;
    } else {
      this.sortDirection = SortDirection.DESC;
    }
  }
}
