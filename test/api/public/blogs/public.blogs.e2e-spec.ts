import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import request from 'supertest';

import { createUserDto } from '../../../data/user-data';
import {
  blogCreatingData,
  updateBlogData,
  updatedBlogWithPagination,
} from '../../../data/blogs-data';
import { AppModule } from '../../../../src/app.module';
import { appSettings } from '../../../../src/app.settings';
import {
  createdPostWithPagination,
  newPostCreatingData,
} from '../../../data/posts-data';
import {
  commentCreatingData,
  commentForBloggerWithPagination,
  createdComment,
} from '../../../data/comments-data';

describe('Blogger blog testing', () => {
  let app: INestApplication;
  let httpServer;

  jest.setTimeout(60 * 1000);

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    //rootMongooseTestModule() should be inside imports
    app = moduleRef.createNestApplication();

    app = appSettings(app);

    await app.init();

    httpServer = app.getHttpServer();
    // await this.query('TRUNCATE table1, table2, table3 CASCADE');
  });

  afterAll(async () => {
    //await closeInMongodConnection();
    await app.close();
  });

  describe('Creating blog,post,comment, update,delete', () => {
    const accessToken = [];
    const users = [];
    const blog = [];
    let post;
    let comment;

    it('should wipe all data in db', async () => {
      const response = await request(httpServer).delete('/testing/all-data');
      expect(response.status).toBe(204);
    });

    it(`Creating user`, async () => {
      const result = await request(httpServer)
        .post('/sa/users')
        .auth('admin', 'qwerty')
        .send(createUserDto)
        .expect(201);

      users.push(result.body);

      expect(users[0].login).toEqual('leo');
    });

    it(`Users login`, async () => {
      const result = await request(httpServer).post('/auth/login').send({
        loginOrEmail: users[0].login,
        password: '123456',
      });
      expect(result.status).toBe(200);

      accessToken.push(result.body.accessToken);
    });

    it(`Blogger creates blog`, async () => {
      const result = await request(app.getHttpServer())
        .post('/blogger/blogs')
        .auth(accessToken[0], { type: 'bearer' })
        .send(blogCreatingData);

      blog.push(result.body);
      expect(result.status).toBe(201);

      expect(blog[0].name).toEqual('Blog');
    });

    it(`Blogger gets blogs`, async () => {
      const result = await request(app.getHttpServer()).get('/blogs').send();
      console.log(result.body);
      expect(result.status).toBe(200);
      expect(result.body.items[0].name).toEqual(`Blog`);
    });

    it(`Updating blog`, async () => {
      const result = await request(app.getHttpServer())
        .put(`/blogger/blogs/${blog[0].id}`)
        .auth(accessToken[0], { type: 'bearer' })
        .send(updateBlogData);
      expect(result.status).toBe(204);
    });

    it(`Blogger gets updated blogs for current owner`, async () => {
      const result = await request(app.getHttpServer())
        .get('/blogger/blogs')
        .auth(accessToken[0], { type: 'bearer' });
      expect(result.status).toBe(200);
      expect(result.body).toEqual(updatedBlogWithPagination);
    });

    it(`Blogger creates post for blog`, async () => {
      const result = await request(app.getHttpServer())
        .post(`/blogger/blogs/${blog[0].id}/posts`)
        .auth(accessToken[0], { type: 'bearer' })
        .send(newPostCreatingData);
      //console.log(blog[0].id);
      post = result.body;
      expect(result.status).toBe(201);
      //expect(result.body).toEqual(returnedCreatedPost);
    });

    it(`Get posts by blogId`, async () => {
      const result = await request(app.getHttpServer())
        .get(`/blogger/blogs/${blog[0].id}/posts`)
        .auth(accessToken[0], { type: 'bearer' });

      expect(result.status).toBe(200);
      expect(result.body).toEqual(createdPostWithPagination);
    });

    it(`Get posts`, async () => {
      const result = await request(app.getHttpServer()).get('/posts');
      expect(result.status).toBe(200);
      expect(result.body).toEqual(createdPostWithPagination);
    });

    it(`Creating comment to post`, async () => {
      const result = await request(app.getHttpServer())
        .post(`/posts/${post.id}/comments`)
        .auth(accessToken[0], { type: 'bearer' })
        .send(commentCreatingData);

      comment = result.body;
      expect(result.status).toBe(201);
      expect(result.body).toEqual(createdComment);
    });

    it(`Blogger gets all comments for blog`, async () => {
      const result = await request(app.getHttpServer())
        .get('/blogger/blogs/comments')
        .auth(accessToken[0], { type: 'bearer' });
      expect(result.status).toBe(200);
      expect(result.body).toEqual(commentForBloggerWithPagination);
    });

    it(`Banning user`, async () => {
      const result = await request(app.getHttpServer())
        .put(`/blogger/users/${users[1].id}/ban`)
        .auth(accessToken[0], { type: 'bearer' })
        .send({
          isBanned: true,
          banReason: 'bad words that not acceptable',
          blogId: blog[0].id,
        });
      expect(result.status).toBe(204);
    });

    it(`Blogger gets all comments for blog`, async () => {
      const result = await request(app.getHttpServer())
        .get('/blogger/blogs/comments')
        .auth(accessToken[0], { type: 'bearer' });
      expect(result.status).toBe(200);
      expect(result.body).toEqual(commentForBloggerWithPagination);
    });
  });
});
