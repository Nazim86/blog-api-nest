import { Blogs } from '../../../entities/blogs/blogs.entity';
import { BlogBanInfo } from '../../../entities/blogs/blogBanInfo.entity';

export type BlogWithBanInfoType = {
  blog: Blogs;
  blogBanInfo: BlogBanInfo;
};
