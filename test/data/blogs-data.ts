export const authorizationData = 'Basic YWRtaW46cXdlcnR5';
export const blogCreatingData = {
  name: 'Blog',
  description: 'creating newblog',
  websiteUrl: 'https://it-incubator.io/',
};

export const updateBlog = {
  name: 'Blog updated',
  description: 'updating blog with new',
  websiteUrl: 'https://blog.io/',
};

export const createdBlogWithoutPagination = {
  id: expect.any(String),
  name: 'Blog',
  description: 'creating newblog',
  websiteUrl: 'https://it-incubator.io/',
  createdAt: expect.any(String),
  isMembership: false,
};

export const updatedBlog = {
  id: expect.any(String),
  name: 'Blog updated',
  description: 'updating blog with new',
  websiteUrl: 'https://blog.io/',
  createdAt: expect.any(String),
  isMembership: false,
};

export const paginationValues = {
  searchName: '',
  sortBy: 'createdAt',
  sortDirection: 'desc',
  pageNumber: expect.any(Number),
  pageSize: expect.any(Number),
};

export const emptyBlogDataWithPagination = {
  pagesCount: expect.any(Number) | 0,
  page: expect.any(Number) | 1,
  pageSize: expect.any(Number) | 10,
  totalCount: expect.any(Number) | 0,
  items: [],
};

export const createdBlogWithPaginationForSa = {
  pagesCount: expect.any(Number) | 1,
  page: expect.any(Number) | 1,
  pageSize: expect.any(Number) | 10,
  totalCount: expect.any(Number) | 1,
  items: [
    {
      id: expect.any(String),
      name: 'Blog',
      description: 'creating newblog',
      websiteUrl: 'https://it-incubator.io/',
      createdAt: expect.any(String),
      isMembership: false,
      blogOwnerInfo: {
        userId: expect.any(String),
        userLogin: 'leo',
      },
      banInfo: {
        isBanned: expect.any(Boolean),
        banDate: expect.any(String),
      },
    },
  ],
};

export const createdBlogWithPaginationForPublic = {
  pagesCount: expect.any(Number) | 1,
  page: expect.any(Number) | 1,
  pageSize: expect.any(Number) | 10,
  totalCount: expect.any(Number) | 1,
  items: [
    {
      id: expect.any(String),
      name: 'Blog',
      description: 'creating newblog',
      websiteUrl: 'https://it-incubator.io/',
      createdAt: expect.any(String),
      isMembership: false,
    },
  ],
};
export const getUpdatedBlog = {
  pagesCount: expect.any(Number) | 1,
  page: expect.any(Number) | 1,
  pageSize: expect.any(Number) | 10,
  totalCount: expect.any(Number) | 1,
  items: [
    {
      id: expect.any(String),
      name: 'Blog updated',
      description: 'updating blog with new',
      websiteUrl: 'https://blog.io/',
      createdAt: expect.any(String),
      isMembership: false,
    },
  ],
};
