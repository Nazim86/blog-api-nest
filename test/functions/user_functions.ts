import request from 'supertest';

export const creatingUser = async (httpServer, createUserDto) => {
  return request(httpServer)
    .post('/sa/users')
    .auth('admin', 'qwerty')
    .send(createUserDto);
};

export const getUsers = async (httpServer, query?) => {
  return request(httpServer)
    .get('/sa/users')
    .auth('admin', 'qwerty')
    .query(query)
    .send()
    .expect(200);
};

export const banUserBySA = async (httpServer, userId, banUserDto) => {
  return request(httpServer)
    .put(`/sa/users/${userId}/ban`)
    .auth('admin', 'qwerty')
    .send(banUserDto)
    .expect(200);
};
