import { ObjectId } from 'mongodb';

export type UserDbType = {
  _id: ObjectId;
  login: string;
  passwordHash: string;
  passwordSalt: string;
  email: string;
  createdAt: string;
};
