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

export const userRegistration = async (httpServer, createUserDto) => {
  return request(httpServer).post(`/auth/registration`).send(createUserDto);
};

export const resendRegistrationEmail = async (httpServer, emailDto) => {
  return request(httpServer)
    .post(`/auth/registration-email-resending`)
    .send(emailDto);
};

export const registrationConfirmation = async (httpServer, code) => {
  return request(httpServer).post(`/auth/registration-confirmation`).send(code);
};
