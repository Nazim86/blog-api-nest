import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../../mongoose-test-module';
import { AppModule } from '../../../src/app.module';
import request from 'supertest';
import { newUserEmail, userCreatedData } from '../../data/user-data';
import {
  bannedUsersDataForBlog,
  blogCreatingData,
  createdBlogWithoutPagination,
} from '../../data/blogs-data';
import { appSettings } from '../../../src/app.settings';

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
    const accessToken = [];
    const users = [];
    const blogs = [];

    it('should wipe all data in db', async () => {
      const response = await request(httpServer).delete('/testing/all-data');
      expect(response.status).toBe(204);
    });

    it(`Creating user`, async () => {
      for (let i = 0; i <= 1; i++) {
        const result = await request(httpServer)
          .post('/sa/users')
          .auth('admin', 'qwerty')
          .send({
            login: `leo${i}`,
            password: '123456',
            email: `nazim86mammadov${i}@yandex.ru`,
          })
          .expect(201);
        users.push(result.body);
      }

      expect(users[0].login).toEqual('leo0');
      expect(users[1].login).toEqual('leo1');
    });

    it(`Users login`, async () => {
      for (let i = 0; i <= 1; i++) {
        const result = await request(httpServer).post('/auth/login').send({
          loginOrEmail: users[i].login,
          password: '123456',
        });
        expect(result.status).toBe(200);

        accessToken.push(result.body.accessToken);
      }
    });

    it(`Blogger creates blog`, async () => {
      for (let i = 0; i <= 1; i++) {
        const result = await request(app.getHttpServer())
          .post('/blogger/blogs')
          .auth(accessToken[i], { type: 'bearer' })
          .send({ ...blogCreatingData, name: `Blog User${i}` });

        blogs.push(result.body);
        expect(result.status).toBe(201);
      }
      expect(blogs[0].name).toEqual('Blog User0');
      expect(blogs[1].name).toEqual('Blog User1');
    });

    it(`Banning user`, async () => {
      const result = await request(app.getHttpServer())
        .put(`/blogger/users/${users[1].id}/ban`)
        .auth(accessToken[0], { type: 'bearer' })
        .send({
          isBanned: true,
          banReason: 'repeated bad words many times ',
          blogId: blogs[0].id,
        });
      expect(result.status).toBe(204);
    });

    it(`Blogger gets all banned users for blog`, async () => {
      const result = await request(app.getHttpServer())
        .get(`/blogger/users/blog/${blogs[0].id}`)
        .auth(accessToken[0], { type: 'bearer' });
      console.log('result body', result.body);

      expect(result.status).toBe(200);
      expect(result.body).toEqual({
        ...bannedUsersDataForBlog,
        items: [
          {
            ...bannedUsersDataForBlog.items[0],
            banInfo: {
              ...bannedUsersDataForBlog.items[0].banInfo,
              isBanned: true,
            },
          },
        ],
      });
    });

    // it(`Unban user by Blogger`, async () => {
    //   const result = await request(app.getHttpServer())
    //     .put(`/blogger/users/${user.id}/ban`)
    //     .auth(accessToken, { type: 'bearer' })
    //     .send({
    //       isBanned: false,
    //       banReason: 'repeated bad words many times',
    //       blogId: blog.id,
    //     });
    //   expect(result.status).toBe(204);
    // });

    // it(`Blogger gets all banned users for blog`, async () => {
    //   const result = await request(app.getHttpServer())
    //     .get(`/blogger/users/blog/${blog.id}`)
    //     .auth(accessToken, { type: 'bearer' });
    //   console.log('result body', result.body);
    //   expect(result.status).toBe(200);
    //   expect(result.body).toEqual({
    //     ...bannedUsersDataForBlog,
    //     items: [
    //       {
    //         ...bannedUsersDataForBlog.items[0],
    //         banInfo: {
    //           ...bannedUsersDataForBlog.items[0].banInfo,
    //           isBanned: true,
    //         },
    //       },
    //     ],
    //   });
    // });

    //TODO Unban users and then check
    //TODO check user if it want to get banned user for its blog or not
  });
});
