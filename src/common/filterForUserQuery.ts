import { BanStatusEnum } from '../api/superadmin/users/user-pagination';
import { RoleEnum } from '../enums/role-enum';

export const filterForUserQuery = (
  searchLoginTerm: string,
  searchEmailTerm?: string,
  banStatus?: BanStatusEnum,
  requestRole?: RoleEnum,
) => {
  const filter: any = {};
  filter.$and = [];

  if (searchLoginTerm || searchEmailTerm) {
    filter.$or = [];
  }

  if (banStatus === BanStatusEnum.banned) {
    filter.$and.push({ 'banInfo.isBanned': true });
  }

  if (banStatus === BanStatusEnum.notBanned) {
    filter.$and.push({ 'banInfo.isBanned': false });
  }

  if (searchLoginTerm && requestRole !== RoleEnum.Blogger) {
    filter.$or.push({
      'accountData.login': {
        $regex: searchLoginTerm,
        $options: 'i',
      },
    });
  }

  if (searchLoginTerm && requestRole === RoleEnum.Blogger) {
    filter.$or.push({
      login: {
        $regex: searchLoginTerm,
        $options: 'i',
      },
    });
  }

  if (searchEmailTerm) {
    filter.$or.push({
      'accountData.email': {
        $regex: searchEmailTerm,
        $options: 'i',
      },
    });
  }

  if (filter.$or && filter.$or.length > 0) {
    filter.$and.push({ $or: filter.$or });
    delete filter.$or;
  }

  if (filter.$and.length === 0) {
    delete filter.$and;
  }
  return filter;
};
