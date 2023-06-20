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
  blogCreatingData,
  createdBlogWithoutPagination,
  createdBlogWithPaginationForPublic,
  updateBlogData,
  updatedBlogWithPagination,
} from '../../data/blogs-data';
import {
  createdPostWithPagination,
  newPostCreatingData,
  returnedCreatedPost,
} from '../../data/posts-data';
import {
  commentCreatingData,
  commentForBloggerWithPagination,
  createdComment,
} from '../../data/comments-data';

describe('Blogger blog testing', () => {
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

  describe('Creating blog,post,comment, update,delete', () => {
    let accessToken;
    let user;
    let blog;
    let post;
    let comment;

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

    it(`Blogger gets blogs for current owner`, async () => {
      const result = await request(app.getHttpServer())
        .get('/blogger/blogs')
        .auth(accessToken, { type: 'bearer' });
      expect(result.status).toBe(200);
      expect(result.body).toEqual(createdBlogWithPaginationForPublic);
    });

    it(`Updating blog`, async () => {
      const result = await request(app.getHttpServer())
        .put(`/blogger/blogs/${blog.id}`)
        .auth(accessToken, { type: 'bearer' })
        .send(updateBlogData);
      expect(result.status).toBe(204);
    });

    it(`Blogger gets updated blogs for current owner`, async () => {
      const result = await request(app.getHttpServer())
        .get('/blogger/blogs')
        .auth(accessToken, { type: 'bearer' });
      expect(result.status).toBe(200);
      expect(result.body).toEqual(updatedBlogWithPagination);
    });

    it(`Blogger creates post for blog`, async () => {
      const result = await request(app.getHttpServer())
        .post(`/blogger/blogs/${blog.id}/posts`)
        .auth(accessToken, { type: 'bearer' })
        .send(newPostCreatingData);

      post = result.body;
      expect(result.status).toBe(201);
      expect(result.body).toEqual(returnedCreatedPost);
    });

    it(`Get posts`, async () => {
      const result = await request(app.getHttpServer()).get('/posts');
      expect(result.status).toBe(200);
      expect(result.body).toEqual(createdPostWithPagination);
    });

    it(`Creating comment to post`, async () => {
      const result = await request(app.getHttpServer())
        .post(`/posts/${post.id}/comments`)
        .auth(accessToken, { type: 'bearer' })
        .send(commentCreatingData);

      comment = result.body;
      expect(result.status).toBe(201);
      expect(result.body).toEqual(createdComment);
    });

    it(`Blogger gets all comments for blog`, async () => {
      const result = await request(app.getHttpServer())
        .get('/blogger/blogs/comments')
        .auth(accessToken, { type: 'bearer' });
      expect(result.status).toBe(200);
      expect(result.body).toEqual(commentForBloggerWithPagination);
    });

    it(`Banning user`, async () => {
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

    it(`Blogger gets all comments for blog`, async () => {
      const result = await request(app.getHttpServer())
        .get('/blogger/blogs/comments')
        .auth(accessToken, { type: 'bearer' });
      expect(result.status).toBe(200);
      expect(result.body).toEqual(commentForBloggerWithPagination);
    });
  });
});

//TODO get all comments for all posts inside all current user blogs
