import { BlogMainImage } from '../../../entities/blogs/blogMainImage.entity';
import { BlogWallpaperImage } from '../../../entities/blogs/blogWallpaperImage.entity';

export type BlogsViewType = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
  images?: { main: BlogMainImage[]; wallpaper: BlogWallpaperImage };
  blogOwnerInfo?: {
    userId: string;
    userLogin: string;
  };
  banInfo?: {
    isBanned: boolean;
    banDate: string;
  };
};
