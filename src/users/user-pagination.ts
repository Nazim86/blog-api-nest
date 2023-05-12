import { Pagination, PaginationType } from '../common/pagination';

export class UserPagination extends Pagination<PaginationType> {
  searchLoginTerm: string;
  searchEmailTerm: string;
}
