import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../../mongoose-test-module';
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
import { AppModule } from '../../../src/app.module';
import { appSettings } from '../../../src/app.settings';

describe('Blogger blog testing', () => {
  let app: INestApplication;
  let httpServer;

  //jest.setTimeout(60 * 1000);

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

    it(`Should return 400 trying to create with empty name`, async () => {
      const result = await request(httpServer)
        .post('/blogger/blogs')
        .auth(accessToken[0], { type: 'bearer' })
        .send();

      expect(result.status).toBe(400);
      //expect(result.body).toEqual(nameField);
    });

    it(`Should return 400 trying to create with longer name`, async () => {
      const result = await request(app.getHttpServer())
        .post('/blogger/blogs')
        .auth(accessToken[0], { type: 'bearer' })
        .send({ ...blogCreatingData, name: `Blog User`.repeat(10) });

      expect(result.status).toBe(400);
      expect(result.body).toEqual(nameField);
    });

    it(`Not create with empty description and return 400`, async () => {
      const result = await request(app.getHttpServer())
        .post('/blogger/blogs')
        .auth(accessToken[0], { type: 'bearer' })
        .send({ ...blogCreatingData, description: null });

      expect(result.status).toBe(400);
      expect(result.body).toEqual(nameField);
    });

    it(`Blogger creates blog`, async () => {
      for (let i = 0; i <= 1; i++) {
        const result = await request(app.getHttpServer())
          .post('/blogger/blogs')
          .auth(accessToken[i], { type: 'bearer' })
          .send({ ...blogCreatingData, name: `Blog User${i}` });

        blog.push(result.body);
        expect(result.status).toBe(201);
      }
      expect(blog[0].name).toEqual('Blog User0');
      expect(blog[1].name).toEqual('Blog User1');
    });

    it(`Blogger gets blogs for current owner`, async () => {
      for (let i = 0; i <= 1; i++) {
        const result = await request(app.getHttpServer())
          .get('/blogger/blogs')
          .auth(accessToken[i], { type: 'bearer' });
        expect(result.status).toBe(200);
        console.log('current owner', result.body);
        expect(result.body.items[0].name).toEqual(`Blog User${i}`);
      }
    });

    // it(`Updating blog`, async () => {
    //   const result = await request(app.getHttpServer())
    //     .put(`/blogger/blogs/${blog.id}`)
    //     .auth(accessToken, { type: 'bearer' })
    //     .send(updateBlogData);
    //   expect(result.status).toBe(204);
    // });
    //
    // it(`Blogger gets updated blogs for current owner`, async () => {
    //   const result = await request(app.getHttpServer())
    //     .get('/blogger/blogs')
    //     .auth(accessToken, { type: 'bearer' });
    //   expect(result.status).toBe(200);
    //   expect(result.body).toEqual(updatedBlogWithPagination);
    // });
    //
    // it(`Blogger creates post for blog`, async () => {
    //   const result = await request(app.getHttpServer())
    //     .post(`/blogger/blogs/${blog.id}/posts`)
    //     .auth(accessToken, { type: 'bearer' })
    //     .send(newPostCreatingData);
    //
    //   post = result.body;
    //   expect(result.status).toBe(201);
    //   expect(result.body).toEqual(returnedCreatedPost);
    // });
    //
    // it(`Get posts by blogId`, async () => {
    //   const result = await request(app.getHttpServer())
    //     .get(`/blogger/blogs/${blog.id}/posts`)
    //     .auth(accessToken, { type: 'bearer' });
    //
    //   expect(result.status).toBe(200);
    //   expect(result.body).toEqual(createdPostWithPagination);
    // });
    //
    // it(`Get posts`, async () => {
    //   const result = await request(app.getHttpServer()).get('/posts');
    //   expect(result.status).toBe(200);
    //   expect(result.body).toEqual(createdPostWithPagination);
    // });
    //
    // it(`Creating comment to post`, async () => {
    //   const result = await request(app.getHttpServer())
    //     .post(`/posts/${post.id}/comments`)
    //     .auth(accessToken, { type: 'bearer' })
    //     .send(commentCreatingData);
    //
    //   comment = result.body;
    //   expect(result.status).toBe(201);
    //   expect(result.body).toEqual(createdComment);
    // });
    //
    // it(`Blogger gets all comments for blog`, async () => {
    //   const result = await request(app.getHttpServer())
    //     .get('/blogger/blogs/comments')
    //     .auth(accessToken, { type: 'bearer' });
    //   expect(result.status).toBe(200);
    //   expect(result.body).toEqual(commentForBloggerWithPagination);
    // });

    // it(`Banning user`, async () => {
    //   const result = await request(app.getHttpServer())
    //     .put(`/blogger/users/${users.id}/ban`)
    //     .auth(accessToken, { type: 'bearer' })
    //     .send({
    //       isBanned: true,
    //       banReason: 'bad words',
    //       blogId: blog.id,
    //     });
    //   expect(result.status).toBe(204);
    // });
    //
    // it(`Blogger gets all comments for blog`, async () => {
    //   const result = await request(app.getHttpServer())
    //     .get('/blogger/blogs/comments')
    //     .auth(accessToken, { type: 'bearer' });
    //   expect(result.status).toBe(200);
    //   expect(result.body).toEqual(commentForBloggerWithPagination);
    // });
  });
});

//TODO get all comments for all posts inside all current user blogs
