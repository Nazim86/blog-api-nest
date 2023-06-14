import { BanStatusEnum } from '../api/superadmin/users/user-pagination';

export const filterForSaQuery = (
  searchLoginTerm: string,
  searchEmailTerm?: string,
  banStatus?: BanStatusEnum,
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

  if (searchLoginTerm) {
    filter.$or.push({
      'accountData.login': {
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
