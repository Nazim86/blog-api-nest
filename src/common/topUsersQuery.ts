export class TopUsersQuery {
  constructor(
    public readonly sort: string[] = ['avgScores desc', 'sumScore desc'], //public readonly sortDirection: SortDirection = SortDirection.DESC,
    public pageNumber: number = 1,
    public readonly pageSize: number = 10,
  ) {
    //   if (
    //     sortDirection === SortDirection.ASC ||
    //     sortDirection === SortDirection.ASC.toLowerCase()
    //   ) {
    //     this.sortDirection = SortDirection.ASC;
    //   } else {
    //     this.sortDirection = SortDirection.DESC;
    //   }
  }
  public get skipSize(): number {
    return (this.pageNumber - 1) * this.pageSize;
  }
  public totalPages(totalCount): number {
    return Math.ceil(totalCount / this.pageSize);
  }
}
