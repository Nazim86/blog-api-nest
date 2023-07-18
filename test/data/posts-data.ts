export const emptyPostData = {
  pagesCount: expect.any(Number) | 0,
  page: expect.any(Number) | 1,
  pageSize: expect.any(Number) | 10,
  totalCount: expect.any(Number) | 0,
  items: [],
};

export const createdPostWithPagination = {
  pagesCount: expect.any(Number) ?? 1,
  page: expect.any(Number) ?? 1,
  pageSize: expect.any(Number) ?? 10,
  totalCount: expect.any(Number) ?? 1,
  items: [
    {
      id: expect.any(String),
      title: 'ChatGPT',
      shortDescription: 'AI',
      content: 'About Ai technologies',
      blogId: expect.any(String),
      blogName: expect.any(String),
      createdAt: expect.any(String),
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
        newestLikes: [],
      },
    },
  ],
};

// export const createdTwoPostWithPagination = {
//     pagesCount: expect.any(Number) ?? 1,
//     page: expect.any(Number) ?? 1,
//     pageSize: expect.any(Number) ?? 10,
//     totalCount: expect.any(Number) ?? 2,
//     items:[ {
//         id: expect.any(String),
//         title: "ChatGPT",
//         shortDescription: "AI",
//         content: "About Ai technologies",
//         blogId: expect.any(String),
//         blogName: expect.any(String),
//         createdAt: expect.any(String)
//     },{
//         id: expect.any(String),
//         title: "ChatGPT",
//         shortDescription: "AI",
//         content: "About Ai technologies",
//         blogId: expect.any(String),
//         blogName: expect.any(String),
//         createdAt: expect.any(String),
//         extendedLikesInfo: {
//             likesCount:0,
//             dislikesCount:0,
//             myStatus: "None",
//             newestLikes:[]
//         }
//     }
//     ]
// }

export const updatedPostWithPagination = {
  pagesCount: expect.any(Number) | 1,
  page: expect.any(Number) | 1,
  pageSize: expect.any(Number) | 10,
  totalCount: expect.any(Number) | 1,
  items: [
    {
      id: expect.any(String),
      title: 'Merlin',
      shortDescription: 'Artificial Intelligence',
      content: 'Usage of Merlin',
      blogId: expect.any(String),
      blogName: expect.any(String),
      createdAt: expect.any(String),
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
        newestLikes: [],
      },
    },
  ],
};

export const postPaginationValues = {
  pageNumber: 1,
  pageSize: 10,
  sortBy: 'createdAt',
  sortDirection: 'desc',
};

export const newPostCreatingData = {
  title: 'ChatGPT',
  shortDescription: 'AI',
  content: 'About Ai technologies',
};

export const newPostByBlogIdData = {
  title: 'ChatGPT',
  shortDescription: 'AI',
  content: 'About Ai technologies',
};

export const updatedPostData = {
  title: 'Merlin',
  shortDescription: 'Artificial Intelligence',
  content: 'Usage of Merlin',
  blogId: '6409dca9e947f5d966149e41',
};

export const postStructure = {
  id: expect.any(String),
  title: expect.any(String),
  shortDescription: expect.any(String),
  content: expect.any(String),
  blogId: expect.any(String),
  blogName: expect.any(String),
  createdAt: expect.any(String),
  extendedLikesInfo: {
    likesCount: expect.any(Number),
    dislikesCount: expect.any(Number),
    myStatus: expect.any(String),
    newestLikes: expect.any(Array),
  },
};

export const likedPostData = [
  {
    id: expect.any(String),
    title: expect.any(String),
    shortDescription: expect.any(String),
    content: expect.any(String),
    blogId: expect.any(String),
    blogName: expect.any(String),
    createdAt: expect.any(String),
    extendedLikesInfo: {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: 'None',
      newestLikes: [],
    },
  },
  {
    id: expect.any(String),
    title: expect.any(String),
    shortDescription: expect.any(String),
    content: expect.any(String),
    blogId: expect.any(String),
    blogName: expect.any(String),
    createdAt: expect.any(String),
    extendedLikesInfo: {
      likesCount: 1,
      dislikesCount: 0,
      myStatus: 'Like',
      newestLikes: [
        {
          addedAt: expect.any(String),
          login: 'Leo0',
          userId: expect.any(String),
        },
      ],
    },
  },

  {
    id: expect.any(String),
    title: expect.any(String),
    shortDescription: expect.any(String),
    content: expect.any(String),
    blogId: expect.any(String),
    blogName: expect.any(String),
    createdAt: expect.any(String),
    extendedLikesInfo: {
      likesCount: 2,
      dislikesCount: 0,
      myStatus: 'Like',
      newestLikes: [
        {
          addedAt: expect.any(String),
          login: 'Leo1',
          userId: expect.any(String),
        },
        {
          addedAt: expect.any(String),
          login: 'Leo0',
          userId: expect.any(String),
        },
      ],
    },
  },

  {
    id: expect.any(String),
    title: expect.any(String),
    shortDescription: expect.any(String),
    content: expect.any(String),
    blogId: expect.any(String),
    blogName: expect.any(String),
    createdAt: expect.any(String),
    extendedLikesInfo: {
      likesCount: 3,
      dislikesCount: 0,
      myStatus: 'Like',
      newestLikes: [
        {
          addedAt: expect.any(String),
          login: 'Leo2',
          userId: expect.any(String),
        },
        {
          addedAt: expect.any(String),
          login: 'Leo1',
          userId: expect.any(String),
        },
        {
          addedAt: expect.any(String),
          login: 'Leo0',
          userId: expect.any(String),
        },
      ],
    },
  },

  {
    id: expect.any(String),
    title: expect.any(String),
    shortDescription: expect.any(String),
    content: expect.any(String),
    blogId: expect.any(String),
    blogName: expect.any(String),
    createdAt: expect.any(String),
    extendedLikesInfo: {
      likesCount: 4,
      dislikesCount: 0,
      myStatus: 'Like',
      newestLikes: [
        {
          addedAt: expect.any(String),
          login: 'Leo3',
          userId: expect.any(String),
        },
        {
          addedAt: expect.any(String),
          login: 'Leo2',
          userId: expect.any(String),
        },
        {
          addedAt: expect.any(String),
          login: 'Leo1',
          userId: expect.any(String),
        },
        {
          addedAt: expect.any(String),
          login: 'Leo0',
          userId: expect.any(String),
        },
      ],
    },
  },
];

export const postLikeDto = { likeStatus: 'Like' };
export const postDislikeDto = { likeStatus: 'Dislike' };

export const nonePostDto = { likeStatus: 'None' };
