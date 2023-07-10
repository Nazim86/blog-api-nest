import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../../mongoose-test-module';
import { AppModule } from '../../../src/app.module';

import { appSettings } from '../../../src/app.settings';
import request from 'supertest';
import { blogCreatingData } from '../../data/blogs-data';
import { contains } from 'class-validator';
import { newPostCreatingData } from '../../data/posts-data';
import { commentCreatingData } from '../../data/comments-data';

describe('Public posts testing', () => {
  let app: INestApplication;
  let httpServer;
  const users = [];
  const blogs = [];
  const accessTokens = [];
  const posts = [];
  const comments = [];

  jest.setTimeout(60 * 1000);
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app = appSettings(app);

    await app.init();

    httpServer = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Creating comment, updating like status of post, return comments to post, return all posts and post by id', () => {
    it('should wipe all data in db', async () => {
      const response = await request(httpServer).delete('/testing/all-data');
      expect(response.status).toBe(204);
    });

    it(`Creating user`, async () => {
      for (let i = 0; i <= 5; i++) {
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

    it(`Blogger creates post for blog`, async () => {
      for (let i = 0; i <= 5; i++) {
        const result = await request(app.getHttpServer())
          .post(`/blogger/blogs/${blogs[i].id}/posts`)
          .auth(accessTokens[i], { type: 'bearer' })
          .send({
            ...newPostCreatingData,
            title: `ChatGPT${i}`,
            content: `About Ai technologies${i}`,
          });
        posts.push(result.body);
        expect(result.status).toBe(201);
        expect(result.body.title).toEqual(`ChatGPT${i}`);
      }
    });

    it(`Public creates comments for post`, async () => {
      for (let i = 0; i <= 5; i++) {
        const result = await request(app.getHttpServer())
          .post(`/posts/${posts[i].id}/comments`)
          .auth(accessTokens[i], { type: 'bearer' })
          .send({ content: `${commentCreatingData.content} + ${i}` });

        console.log(result.body);

        comments.push(result.body);

        expect(result.status).toBe(201);
        expect(result.body.content).toEqual(`${commentCreatingData} + ${i}`);
      }
    });
  });
});
