export type UserViewType = {
  id: string;
  login: string;
  email: string;
  createdAt: Date;
  banInfo?: {
    isBanned: boolean;
    banDate: string;
    banReason: string;
  };
};
