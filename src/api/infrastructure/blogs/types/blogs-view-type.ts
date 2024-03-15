export type BlogWallpaperImageType = {
  url: string;
  width: number;
  height: number;
  fileSize: number;
};

export type BlogMainImageType = {
  url: string;
  width: number;
  height: number;
  fileSize: number;
};

export type BlogsViewType = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
  images?: { wallpaper: BlogWallpaperImageType; main: BlogMainImageType[] };
  blogOwnerInfo?: {
    userId: string;
    userLogin: string;
  };
  banInfo?: {
    isBanned: boolean;
    banDate: string;
  };
};
