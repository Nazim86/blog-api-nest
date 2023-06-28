import { BanStatusEnum } from '../api/superadmin/users/user-pagination';
import { RoleEnum } from '../enums/role-enum';

export const filterForUserQuery = (
  searchLoginTerm: string,
  searchEmailTerm?: string,
  banStatus?: BanStatusEnum,
  requestRole?: RoleEnum,
) => {
  let banStatus01 = true;
  let banStatus02 = false;
  let searchEmail = '%';
  let searchLogin = '%';

  const filter: any = {};
  filter.$and = [];

  // if (searchLoginTerm || searchEmailTerm) {
  //   filter.$or = [];
  // }

  if (banStatus === BanStatusEnum.banned) {
    banStatus02 = true; //filter.$and.push({ 'banInfo.isBanned': true });
  }

  if (banStatus === BanStatusEnum.notBanned) {
    banStatus01 = false; //filter.$and.push({ 'banInfo.isBanned': false });
  }

  if (searchLoginTerm && !searchEmailTerm && requestRole !== RoleEnum.Blogger) {
    searchLogin = `%${searchLoginTerm}%`;
    searchEmail = '';
    // filter.$or.push({
    //   'accountData.login': {
    //     $regex: searchLoginTerm,
    //     $options: 'i',
    //   },
    // });
  }

  if (searchLoginTerm && requestRole === RoleEnum.Blogger) {
    filter.$or.push({
      login: {
        $regex: searchLoginTerm,
        $options: 'i',
      },
    });
  }

  if (searchEmailTerm && !searchLoginTerm) {
    searchEmail = `%${searchEmailTerm}%`;
    searchLogin = '';
    // filter.$or.push({
    //   'accountData.email': {
    //     $regex: searchEmailTerm,
    //     $options: 'i',
    //   },
    // });
  }

  if (searchEmailTerm && searchLoginTerm) {
    searchEmail = `%${searchEmailTerm}%`;
    searchLogin = `%${searchLoginTerm}%`;
  }

  // if (filter.$or && filter.$or.length > 0) {
  //   filter.$and.push({ $or: filter.$or });
  //   delete filter.$or;
  // }
  //
  // if (filter.$and.length === 0) {
  //   delete filter.$and;
  // }

  return {
    banStatus01: banStatus01,
    banStatus02: banStatus02,
    searchLogin: searchLogin,
    searchEmail: searchEmail,
  };
};
