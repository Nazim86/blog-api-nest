import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../../mongoose-test-module';
import { AppModule } from '../../../src/app.module';
import request from 'supertest';
import { blogCreatingData } from '../../data/blogs-data';
import { appSettings } from '../../../src/app.settings';
import {
  creatingUser,
  getAllBannedUsersForBlog,
} from '../../functions/user_functions';

describe('Blogger user testing', () => {
  let app: INestApplication;
  let httpServer;

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

  describe('Banning, unbanning user, get all banned users ', () => {
    const accessTokens = [];
    const users = [];
    const blogs = [];

    it('should wipe all data in db', async () => {
      const response = await request(httpServer).delete('/testing/all-data');
      expect(response.status).toBe(204);
    });

    it(`Creating user`, async () => {
      for (let i = 0; i <= 5; i++) {
        const result = await creatingUser(httpServer, {
          login: `leo${i}`,
          password: '123456',
          email: `nazim86mammadov${i}@yandex.ru`,
        });
        // const result = await request(httpServer)
        //   .post('/sa/users')
        //   .auth('admin', 'qwerty')
        //   .send({
        //     login: `leo${i}`,
        //     password: '123456',
        //     email: `nazim86mammadov${i}@yandex.ru`,
        //   })
        expect(result.status).toBe(201);
        users.push(result.body);
      }

      expect(users[0].login).toEqual('leo0');
      expect(users[1].login).toEqual('leo1');
    });

    it(`Users login`, async () => {
      for (let i = 0; i <= 5; i++) {
        const result = await request(httpServer).post('/auth/login').send({
          loginOrEmail: users[i].login,
          password: '123456',
        });
        expect(result.status).toBe(200);

        accessTokens.push(result.body.accessToken);
      }
    });

    it(`Blogger creates blog`, async () => {
      for (let i = 0; i <= 5; i++) {
        const result = await request(app.getHttpServer())
          .post('/blogger/blogs')
          .auth(accessTokens[i], { type: 'bearer' })
          .send({ ...blogCreatingData, name: `Blog User${i}` });

        blogs.push(result.body);
        expect(result.status).toBe(201);
      }
      expect(blogs[0].name).toEqual('Blog User0');
      expect(blogs[1].name).toEqual('Blog User1');
    });

    it(`Should NOT Ban user with wrong isBanned and return 400`, async () => {
      const result = await request(app.getHttpServer())
        .put(`/blogger/users/${users[1].id}/ban`)
        .auth(accessTokens[0], { type: 'bearer' })
        .send({
          isBanned: 123,
          banReason: 'repeated bad words many times ',
          blogId: blogs[0].id,
        });
      expect(result.status).toBe(400);
      expect(result.body.errorsMessages[0].field).toEqual('isBanned');
    });

    it(`Should NOT Ban user with wrong blogId and return 400`, async () => {
      const result = await request(app.getHttpServer())
        .put(`/blogger/users/${users[1].id}/ban`)
        .auth(accessTokens[0], { type: 'bearer' })
        .send({
          isBanned: true,
          banReason: 'repeated bad words many times ',
          blogId: 123,
        });
      expect(result.status).toBe(400);
      expect(result.body.errorsMessages[0].field).toEqual('blogId');
    });

    it(`Should NOT ban user with banReason length less than 20 and return 400`, async () => {
      const result = await request(app.getHttpServer())
        .put(`/blogger/users/${users[1].id}/ban`)
        .auth(accessTokens[0], { type: 'bearer' })
        .send({
          isBanned: true,
          banReason: 'repeated',
          blogId: blogs[0].id,
        });
      expect(result.status).toBe(400);
      expect(result.body.errorsMessages[0].field).toEqual('banReason');
    });

    it(`Should NOT authorize to ban user with wrong accessToken and return 401`, async () => {
      const result = await request(app.getHttpServer())
        .put(`/blogger/users/${users[1].id}/ban`)
        .auth('accessTokens[0]', { type: 'bearer' })
        .send({
          isBanned: true,
          banReason: 'repeated bad words many times ',
          blogId: blogs[0].id,
        });
      expect(result.status).toBe(401);
    });

    it(`Should NOT allow blogger to ban user if blog does not belong him and return 403 `, async () => {
      const result = await request(app.getHttpServer())
        .put(`/blogger/users/${users[1].id}/ban`)
        .auth(accessTokens[3], { type: 'bearer' })
        .send({
          isBanned: true,
          banReason: 'repeated bad words many times ',
          blogId: blogs[0].id,
        });
      expect(result.status).toBe(403);
    });

    it(`Banning user`, async () => {
      for (let i = 1; i <= 5; i++) {
        const result = await request(app.getHttpServer())
          .put(`/blogger/users/${users[i].id}/ban`)
          .auth(accessTokens[0], { type: 'bearer' })
          .send({
            isBanned: true,
            banReason: 'repeated bad words many times ',
            blogId: blogs[0].id,
          });
        expect(result.status).toBe(204);
      }
    });

    it(`Blogger gets all banned users for blog`, async () => {
      const result = await getAllBannedUsersForBlog(
        httpServer,
        blogs[0].id,
        accessTokens[0],
      );
      expect(result.status).toBe(200);
      expect(result.body.items[0].length).toBe(5);
      expect(result.body.items[0].login).toEqual('leo5');
      expect(result.body.items[1].login).toEqual('leo4');
      expect(result.body.items[2].login).toEqual('leo3');
      // expect(result.body).toEqual({
      //   ...bannedUsersDataForBlog,
      //   items: [
      //     {
      //       ...bannedUsersDataForBlog.items[0],
      //       login: 'leo1',
      //       banInfo: {
      //         ...bannedUsersDataForBlog.items[0].banInfo,
      //         isBanned: true,
      //       },
      //     },
      //   ],
      // });
    });

    it(`Unban user by Blogger`, async () => {
      const result = await request(app.getHttpServer())
        .put(`/blogger/users/${users[1].id}/ban`)
        .auth(accessTokens[0], { type: 'bearer' })
        .send({
          isBanned: false,
          banReason: 'repeated bad words many times',
          blogId: blogs[0].id,
        });
      expect(result.status).toBe(204);
    });

    it(`Should NOT get blogger gets all banned users for blog with wrong accessToken and return 401`, async () => {
      const result = await request(app.getHttpServer())
        .get(`/blogger/users/blog/${blogs[0].id}`)
        .auth('accessTokens[0]', { type: 'bearer' });
      expect(result.status).toBe(401);
    });

    it(`Should get no users when blogger gets all banned users for blog`, async () => {
      const result = await request(app.getHttpServer())
        .get(`/blogger/users/blog/${blogs[0].id}`)
        .auth(accessTokens[0], { type: 'bearer' });
      expect(result.status).toBe(200);
      expect(result.body.items.length).toBe(4);
    });
  });
});
