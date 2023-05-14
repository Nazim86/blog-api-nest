import * as process from 'process';

export const jwtConstants = {
  secret: 'secretKey',
};

export const basicConstants = {
  username: process.env.SA_LOGIN,
  password: process.env.SA_PASSWORD,
};
