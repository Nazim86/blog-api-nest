import { PublishedStatusEnum } from '../../../../enums/publishedStatus-enum';
import { SortDirection } from '../../../../enums/sort-direction.enum';
import { Paginator } from '../../../../common/paginator';

export class QuestionQueryClass extends Paginator {
  constructor(
    public readonly bodySearchTerm: string = '%',
    public readonly publishedStatus: PublishedStatusEnum = PublishedStatusEnum.all,
    public readonly sortBy: string = 'createdAt',
    public readonly sortDirection: SortDirection = SortDirection.DESC,
    public readonly pageNumber: number = 1,
    public readonly pageSize: number = 10,
  ) {
    super(pageNumber, pageSize);
    this.sortBy = sortBy;
    if (
      sortDirection === SortDirection.ASC ||
      sortDirection === SortDirection.ASC.toLowerCase()
    ) {
      this.sortDirection = SortDirection.ASC;
    } else {
      this.sortDirection = SortDirection.DESC;
    }
    this.bodySearchTerm = bodySearchTerm;
    this.publishedStatus = publishedStatus;
  }
}
