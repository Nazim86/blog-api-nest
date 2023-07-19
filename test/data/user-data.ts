export const newUserEmail = 'nazim86mammadov@yandex.ru';

export const emailDto = { email: 'nazim86mammadov@yandex.ru' };

export const createUserDto = {
  login: 'leo',
  password: '123456',
  email: newUserEmail,
};

export const loginDto = {
  loginOrEmail: 'leo',
  password: '123456',
};

export const userBanDto = {
  isBanned: true,
  banReason: 'asdasdasasdasdadasdaasdad',
};

export const userPaginationValues = {
  pageNumber: 1,
  pageSize: 10,
  sortBy: 'createdAt',
  sortDirection: 'desc',
  searchLoginTerm: null,
  searchEmailTerm: null,
};

export const emptyUsersDataWithPagination = {
  pagesCount: expect.any(Number) | 0,
  page: expect.any(Number) | 1,
  pageSize: expect.any(Number) | 10,
  totalCount: expect.any(Number) | 0,
  items: [],
};

export const createdUserWithPagination = {
  pagesCount: expect.any(Number) | 1,
  page: expect.any(Number) | 1,
  pageSize: expect.any(Number) | 10,
  totalCount: expect.any(Number) | 1,
  items: [
    {
      id: expect.any(String),
      login: 'Leo',
      email: newUserEmail,
      createdAt: expect.any(String),
    },
  ],
};

export const userCreateData = {
  login: 'Leo',
  password: '123456',
  email: newUserEmail,
};

export const userCreatedData = {
  id: expect.any(String),
  login: 'leo',
  email: newUserEmail,
  createdAt: expect.any(String),
  banInfo: {
    isBanned: expect.any(Boolean),
    banDate: null,
    banReason: null,
  },
};
