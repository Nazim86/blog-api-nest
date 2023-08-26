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
import { createUserDto, loginDto } from '../../data/user-data';
import { appSettings } from '../../../src/app.settings';
import {
  creatingUser,
  deleteUser,
  loginUser,
} from '../../functions/user_functions';

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

    it(`Blogger creates blog`, async () => {
      const createUser = await creatingUser(httpServer, createUserDto);
      user = createUser.body;

      const userSignIn = await loginUser(httpServer, loginDto);
      accessToken = userSignIn.body.accessToken;

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

      console.log('blog in test', result.body);
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

    it(`After deleting user BlogOwnerInfo.login should be null`, async () => {
      await deleteUser(httpServer, user.id);

      const result = await request(app.getHttpServer())
        .get('/sa/blogs')
        .auth('admin', 'qwerty');
      expect(result.status).toBe(200);
      expect(result.body).toEqual(blogWithBlogOwnerInfoNull);
    });

    // it(`Creating user`, async () => {
    //   const result = await creatingUser(httpServer, createUserDto);
    //   expect(result.status).toBe(201);
    //   user = result.body;
    // });
    //
    // it(`Should bind blog with user`, async () => {
    //   const result = await request(app.getHttpServer())
    //     .put(`/sa/blogs/${blog.id}/bind-with-user/${user.id}`)
    //     .auth('admin', 'qwerty');
    //   expect(result.status).toBe(204);
    // });
    //
    // it(`BlogOwnerInfo.login should be leonid`, async () => {
    //   const result = await request(app.getHttpServer())
    //     .get('/sa/blogs')
    //     .auth('admin', 'qwerty');
    //   expect(result.status).toBe(200);
    //   expect(result.body).toEqual({
    //     ...blogWithBlogOwnerInfoNull,
    //     items: [
    //       {
    //         ...blogWithBlogOwnerInfoNull.items[0],
    //         blogOwnerInfo: {
    //           ...blogWithBlogOwnerInfoNull.items[0].blogOwnerInfo,
    //           userLogin: 'leonid',
    //           userId: expect.any(String),
    //         },
    //       },
    //     ],
    //   });
    // });
  });
});
