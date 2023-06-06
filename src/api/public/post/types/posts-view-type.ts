export type NewestLikesType = {
  addedAt: Date;
  userId: string | undefined;
  login: string;
};

export type ExtendedLikesInfoType = {
  likesCount: number;
  dislikesCount: number;
  myStatus: string;
  newestLikes: NewestLikesType[];
};

export type PostsViewType = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string | null;
  createdAt: string;
  extendedLikesInfo: ExtendedLikesInfoType;
};
