import { ObjectId } from 'mongodb';

export const newUserEmail = 'nazim86mammadov@yandex.ru';
export const newUserData = {
  login: 'Leo',
  password: '123456',
  email: newUserEmail,
};

export const currentUser = {
  email: newUserEmail,
  login: 'Leo',
  userId: expect.any(String),
};

export const createdUser = {
  _id: expect.any(ObjectId),
  accountData: {
    login: 'Leo',
    passwordHash: expect.any(String),
    email: newUserEmail,
    createdAt: expect.any(String),
    recoveryCode: expect.any(String),
    recoveryCodeExpiration: expect.any(Date),
  },
  emailConfirmation: {
    confirmationCode: expect.any(String),
    emailExpiration: expect.any(Date),
    isConfirmed: false,
    sentEmailsByDate: expect.any(Date),
  },
};
