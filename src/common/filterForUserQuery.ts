import { BanStatusEnum } from '../api/superadmin/users/user-pagination';
import { RoleEnum } from '../enums/role-enum';

export const filterForUserQuery = (
  searchLoginTerm: string,
  searchEmailTerm?: string,
  banStatus?: BanStatusEnum,
  requestRole?: RoleEnum,
) => {
  let banStatus01: boolean | null = null;

  let searchEmail = '%%';
  let searchLogin = '%%';

  // const filter: any = {};
  // //filter.$and = [];
  //
  // // if (searchLoginTerm || searchEmailTerm) {
  // //   filter.$or = [];
  // // }

  if (banStatus === BanStatusEnum.banned) {
    banStatus01 = true; //filter.$and.push({ 'banInfo.isBanned': true });
  }

  if (banStatus === BanStatusEnum.notBanned) {
    banStatus01 = false; //filter.$and.push({ 'banInfo.isBanned': false });
  }

  if (searchLoginTerm && !searchEmailTerm && requestRole !== RoleEnum.Blogger) {
    searchLogin = searchLoginTerm;
    searchEmail = '';
  }

  if (searchEmailTerm && !searchLoginTerm) {
    searchEmail = searchEmailTerm;
    searchLogin = '';
  }

  if (searchEmailTerm && searchLoginTerm) {
    searchEmail = searchEmailTerm;
    searchLogin = searchLoginTerm;
  }

  return {
    banStatus01: banStatus01,
    //banStatus02: banStatus02,
    searchLogin: searchLogin,
    searchEmail: searchEmail,
  };
};
