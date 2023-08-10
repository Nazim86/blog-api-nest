export type UserViewType = {
  id: string;
  login: string;
  email: string;
  createdAt: string;
  banInfo?: {
    isBanned: boolean;
    banDate: string;
    banReason: string;
  };
};
