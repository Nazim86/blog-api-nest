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
    let accessToken;
    let blog;
    let user;

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
        users.push(user.body);
      }
    });

    it(`Get users`, async () => {
      const result = await getUsers(httpServer);

      expect(result.body.totalCount).toBe(5);
      expect(result.body.items.length).toBe(5);
    });

    it(`Ban user`, async () => {
      await banUserBySA(httpServer, users[0].id, userBanDto);

      const result = await getUsers(httpServer);

      console.log(result.body.items[4].banInfo.isBanned);

      expect(result.body.items[4].banInfo.isBanned).toBe(true);
    });

    //
    // it(`Deleting user`, async () => {
    //   const result = await request(app.getHttpServer())
    //     .delete(`/sa/users/${user.id}`)
    //     .auth('admin', 'qwerty')
    //     .send({
    //       isBanned: false,
    //     });
    //   expect(result.status).toBe(204);
    // });
  });
});
