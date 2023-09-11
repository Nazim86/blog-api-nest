export class Paginator {
  constructor(public readonly pageNumber = 1, public readonly pageSize = 10) {}

  public totalPages(totalCount): number {
    return Math.ceil(totalCount / this.pageSize);
  }

  public get skipSize(): number {
    return (this.pageNumber - 1) * this.pageSize;
  }
}
