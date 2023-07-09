import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../../src/app.module';

import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../../mongoose-test-module';
import {
  blogCreatingData,
  blogWithBlogOwnerInfoNull,
  createdBlogWithoutPagination,
  createdBlogWithPaginationForPublic,
  createdBlogWithPaginationForSa,
  emptyBlogDataWithPagination,
} from '../../data/blogs-data';
import {
  emptyUsersDataWithPagination,
  newUserEmail,
  userCreatedData,
} from '../../data/user-data';
import { appSettings } from '../../../src/app.settings';

describe('Super Admin blogs testing', () => {
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

  describe('Creating user,blog,binding,banning,unbaning ', () => {
    let accessToken;
    let blog;
    let user;

    it('should wipe all data in db', async () => {
      const response = await request(httpServer).delete('/testing/all-data');
      expect(response.status).toBe(204);
    });

    it(`Creating user`, async () => {
      const result = await request(app.getHttpServer())
        .post('/sa/users')
        .auth('admin', 'qwerty')
        .send({
          login: 'leo',
          password: '123456',
          email: newUserEmail,
        })
        .expect(201);
      user = result.body;
      expect(result.body).toEqual(userCreatedData);
    });

    it(`User login`, async () => {
      const result = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          loginOrEmail: 'leo',
          password: '123456',
        });
      expect(result.status).toBe(200);
      accessToken = result.body.accessToken;
    });

    it(`Blogger creates blog`, async () => {
      const result = await request(app.getHttpServer())
        .post('/blogger/blogs')
        .auth(accessToken, { type: 'bearer' })
        .send(blogCreatingData);

      blog = result.body;
      expect(result.status).toBe(201);
      expect(result.body).toEqual(createdBlogWithoutPagination);
    });

    it(`Banning blog`, async () => {
      const result = await request(app.getHttpServer())
        .put(`/sa/blogs/${blog.id}/ban`)
        .auth('admin', 'qwerty')
        .send({
          isBanned: true,
        });
      expect(result.status).toBe(200);
    });

    it(`Does not show banned blogs in public api`, async () => {
      const result = await request(app.getHttpServer()).get(`/blogs`);
      expect(result.status).toBe(200);
      expect(result.body).toEqual(emptyBlogDataWithPagination);
    });

    it(`Does not show banned blogById in public api`, async () => {
      const result = await request(app.getHttpServer()).get(
        `/blogs/${blog.id}`,
      );
      expect(result.status).toBe(404);
    });

    it(`Super Admin get all (banned or unbanned) blogs with pagination`, async () => {
      const result = await request(app.getHttpServer())
        .get('/sa/blogs')
        .auth('admin', 'qwerty');
      expect(result.status).toBe(200);
      expect(result.body).toEqual(createdBlogWithPaginationForSa);
    });

    it(`Unbanning blog`, async () => {
      const result = await request(app.getHttpServer())
        .put(`/sa/blogs/${blog.id}/ban`)
        .auth('admin', 'qwerty')
        .send({
          isBanned: false,
        });
      expect(result.status).toBe(200);
    });

    it(`Must show unbanned blogs in public api`, async () => {
      const result = await request(app.getHttpServer()).get(`/blogs`);
      expect(result.status).toBe(200);
      expect(result.body).toEqual(createdBlogWithPaginationForPublic);
    });

    it(`Deleting user`, async () => {
      const result = await request(app.getHttpServer())
        .delete(`/sa/users/${user.id}`)
        .auth('admin', 'qwerty')
        .send({
          isBanned: false,
        });
      expect(result.status).toBe(204);
    });

    it(`Super Admin should get no users`, async () => {
      const result = await request(app.getHttpServer())
        .get('/sa/users')
        .auth('admin', 'qwerty');

      expect(result.status).toBe(200);
      expect(result.body).toEqual(emptyUsersDataWithPagination);
    });

    it(`BlogOwnerInfo.login should be null`, async () => {
      const result = await request(app.getHttpServer())
        .get('/sa/blogs')
        .auth('admin', 'qwerty');
      expect(result.status).toBe(200);
      expect(result.body).toEqual(blogWithBlogOwnerInfoNull);
    });

    it(`Creating user`, async () => {
      const result = await request(app.getHttpServer())
        .post('/sa/users')
        .auth('admin', 'qwerty')
        .send({
          login: 'leonid',
          password: '123456',
          email: newUserEmail,
        })
        .expect(201);
      user = result.body;
    });

    it(`Should bing blog with user`, async () => {
      const result = await request(app.getHttpServer())
        .put(`/sa/blogs/${blog.id}/bind-with-user/${user.id}`)
        .auth('admin', 'qwerty');
      expect(result.status).toBe(204);
    });

    it(`BlogOwnerInfo.login should be leonid`, async () => {
      const result = await request(app.getHttpServer())
        .get('/sa/blogs')
        .auth('admin', 'qwerty');
      expect(result.status).toBe(200);
      expect(result.body).toEqual({
        ...blogWithBlogOwnerInfoNull,
        items: [
          {
            ...blogWithBlogOwnerInfoNull.items[0],
            blogOwnerInfo: {
              ...blogWithBlogOwnerInfoNull.items[0].blogOwnerInfo,
              userLogin: 'leonid',
              userId: expect.any(String),
            },
          },
        ],
      });
    });
  });
});
