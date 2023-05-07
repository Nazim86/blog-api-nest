import { UserDocument } from './user.entity';
import { UserViewType } from './types/user-view-type';

export const userMapping = (newUser: UserDocument[]): UserViewType[] => {
  return newUser.map((user: UserDocument): UserViewType => {
    return {
      id: user._id.toString(),
      login: user.accountData.login,
      email: user.accountData.email,
      createdAt: user.accountData.createdAt,
    };
  });
};
