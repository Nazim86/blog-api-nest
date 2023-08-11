import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../../src/app.module';

import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../../mongoose-test-module';

import { createUserDto, userBanDto } from '../../data/user-data';
import { appSettings } from '../../../src/app.settings';
import {
  banUserBySA,
  creatingUser,
  deleteUser,
  getUsers,
} from '../../functions/user_functions';

describe('Super Admin blogs testing', () => {
  let app: INestApplication;
  let httpServer;
  const countOfUsers = 5;
  const users = [];

  jest.setTimeout(60 * 1000);
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [rootMongooseTestModule(), AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    app = appSettings(app);

    await app.init();

    httpServer = app.getHttpServer();
  });

  afterAll(async () => {
    await closeInMongodConnection();
    await app.close();
  });

  describe('Creating user,blog,binding,banning,unbaning ', () => {
    it('should wipe all data in db', async () => {
      const response = await request(httpServer).delete('/testing/all-data');
      expect(response.status).toBe(204);
    });

    it(`Creating user`, async () => {
      for (let i = 0; i < countOfUsers; i++) {
        const user = await creatingUser(httpServer, {
          ...createUserDto,
          login: `leo${i}`,
          email: `nazim86mammadov${i}@yandex.ru`,
        });
        expect(user.status).toBe(201);
        expect(user.body.login).toEqual(`leo${i}`);
        expect(user.body.email).toEqual(`nazim86mammadov${i}@yandex.ru`);
        expect(user.body.banInfo.isBanned).toBe(false);
        expect(user.body.banInfo.banDate).toBe(null);
        expect(user.body.banInfo.banReason).toBe(null);
        users.push(user.body);
      }
    });

    it(`Get users`, async () => {
      const result = await getUsers(httpServer);

      expect(result.body.totalCount).toBe(5);
      expect(result.body.items.length).toBe(5);
      expect(result.body.items[0].banInfo.isBanned).toBe(false);
      expect(result.body.items[0].banInfo.banReason).toBe(null);
      expect(result.body.items[0].banInfo.banDate).toBe(null);
      expect(result.body.items[0].banInfo.isBanned).toEqual(
        expect.any(Boolean),
      );
    });

    it(`Ban user`, async () => {
      const usersBeforeBan = await getUsers(httpServer);

      expect(usersBeforeBan.body.items[4].banInfo.isBanned).toBe(false);

      await banUserBySA(httpServer, users[0].id, userBanDto);

      const usersAfterBan = await getUsers(httpServer);

      expect(usersAfterBan.body.items[4].banInfo.isBanned).toBe(true);
    });

    it(`Unban user`, async () => {
      await banUserBySA(httpServer, users[0].id, {
        ...userBanDto,
        isBanned: false,
      });

      const result = await getUsers(httpServer);

      expect(result.body.items[4].banInfo.isBanned).toBe(false);
    });

    it(`Deleting user`, async () => {
      let result = await getUsers(httpServer);
      expect(result.body.items.length).toBe(5);

      const isDeleted = await deleteUser(httpServer, users[0].id);
      expect(isDeleted.status).toBe(204);

      result = await getUsers(httpServer);
      expect(result.body.items.length).toBe(4);
    });
  });
});
