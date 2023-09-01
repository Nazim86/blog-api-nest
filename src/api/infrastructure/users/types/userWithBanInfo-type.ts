import { Users } from '../../../entities/users/user.entity';
import { UsersBanBySa } from '../../../entities/users/users-ban-by-sa.entity';

export type UserWithBanInfo = {
  user: Users;
  usersBanBySA: UsersBanBySa;
};
