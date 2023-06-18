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

describe('Blogger user testing', () => {
  let app: INestApplication;
  jest.setTimeout(60 * 1000);
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [rootMongooseTestModule(), AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await closeInMongodConnection();
    await app.close();
  });

  describe('Banning, unbanning user, get all banned users ', () => {
    let accessToken;
    let user;
    let blog;

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

    it(`Banning user`, async () => {
      console.log(user.id);
      const result = await request(app.getHttpServer())
        .put(`/blogger/users/${user.id}/ban`)
        .auth(accessToken, { type: 'bearer' })
        .send({
          isBanned: true,
          banReason: 'bad words',
          blogId: blog.id,
        });
      expect(result.status).toBe(204);
    });

    it(`Blogger gets all banned users for blog`, async () => {
      const result = await request(app.getHttpServer())
        .get(`/blogger/users/blog/${blog.id}`)
        .auth(accessToken, { type: 'bearer' });
      expect(result.status).toBe(200);
      console.log(result.body);
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
  });
});
