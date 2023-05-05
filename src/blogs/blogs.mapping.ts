import { BlogsDbType } from './types/blogs-db-type';
import { BlogsViewType } from './types/blogs-view-type';

export const blogsMapping = (array: BlogsDbType[]): BlogsViewType[] => {
  return array.map((blog: BlogsDbType): BlogsViewType => {
    return {
      id: blog._id.toString(),
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
    };
  });
};
