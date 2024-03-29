import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import request from 'supertest';
import {
  blogCreatingData,
  updateBlogData,
  updatedBlogWithPagination,
} from '../../data/blogs-data';
import {
  createdPostWithPagination,
  newPostCreatingData,
} from '../../data/posts-data';
import {
  commentCreatingData,
  commentForBloggerWithPagination,
  createdComment,
} from '../../data/comments-data';
import { AppModule } from '../../../src/app.module';
import { appSettings } from '../../../src/app.settings';
import { nameField } from '../../data/400 error-data';
import { deleteBlogById, getBlogById } from '../../functions/blog_functions';
import { join } from 'path';
import { BlogsQueryRepo } from '../../../src/api/infrastructure/blogs/blogs-query.repository';

describe('Blogger blog testing', () => {
  let app: INestApplication;
  let httpServer;
  let blogQueryRepo: BlogsQueryRepo;

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
    blogQueryRepo = moduleRef.get<BlogsQueryRepo>(BlogsQueryRepo);

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

    it('should wipe all data in db', async () => {
      const response = await request(httpServer).delete('/testing/all-data');
      expect(response.status).toBe(204);
    });
    it(`Creating user`, async () => {
      for (let i = 0; i <= 2; i++) {
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
      expect(result.body.errorsMessages[0].field).toEqual(nameField);
    });

    it(`Not create with empty description and return 400`, async () => {
      const result = await request(app.getHttpServer())
        .post('/blogger/blogs')
        .auth(accessToken[0], { type: 'bearer' })
        .send({ ...blogCreatingData, description: null });

      expect(result.status).toBe(400);
      expect(result.body.errorsMessages[0].field).toEqual('description');
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

    it(`User subscribe to blog`, async () => {
      const result = await request(app.getHttpServer())
        .post(`/blogs/${blog[0].id}/subscription`)
        .auth(accessToken[1], { type: 'bearer' });
      expect(result.status).toBe(201);
    });

    // it(`User 2 subscribe to blog`, async () => {
    //   const result = await request(app.getHttpServer())
    //     .post(`/blogs/${blog[0].id}/subscription`)
    //     .auth(accessToken[0], { type: 'bearer' });
    //   expect(result.status).toBe(201);
    // });

    it(`Get posts by blogId`, async () => {
      const result = await request(app.getHttpServer())
        .get(`/blogs/${blog[0].id}`)
        .auth(accessToken[0], { type: 'bearer' });

      console.log('result.body in get posts by blogId', result.body);
      expect(result.status).toBe(200);

      // const getBlog = await blogQueryRepo.getBlogById(blog[0].id, users[0].id);
      // console.log(getBlog);
    });

    // it(`Blogger gets blogs for current owner`, async () => {
    //   const result = await request(app.getHttpServer())
    //     .get('/blogger/blogs')
    //     .auth(accessToken[0], { type: 'bearer' });
    //   expect(result.status).toBe(200);
    //   expect(result.body.items[0].name).toEqual(`Blog User${0}`);
    // });
    //
    // it(`Updating blog`, async () => {
    //   const result = await request(app.getHttpServer())
    //     .put(`/blogger/blogs/${blog[0].id}`)
    //     .auth(accessToken[0], { type: 'bearer' })
    //     .send(updateBlogData);
    //   expect(result.status).toBe(204);
    // });
    //
    // it(`Blogger gets updated blogs for current owner`, async () => {
    //   const result = await request(app.getHttpServer())
    //     .get('/blogger/blogs')
    //     .auth(accessToken[0], { type: 'bearer' });
    //   expect(result.status).toBe(200);
    //   expect(result.body).toEqual(updatedBlogWithPagination);
    // });
    //
    // it(`Blogger creates post for blog`, async () => {
    //   const result = await request(app.getHttpServer())
    //     .post(`/blogger/blogs/${blog[0].id}/posts`)
    //     .auth(accessToken[0], { type: 'bearer' })
    //     .send(newPostCreatingData);
    //   //console.log(blog[0].id);
    //   post = result.body;
    //   //console.log('post in create blog test', post);
    //   expect(result.status).toBe(201);
    //   //expect(result.body).toEqual(returnedCreatedPost);
    // });
    //
    // it(`Get posts by blogId`, async () => {
    //   const result = await request(app.getHttpServer())
    //     .get(`/blogger/blogs/${blog[0].id}/posts`)
    //     .auth(accessToken[0], { type: 'bearer' });
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
    //     .auth(accessToken[0], { type: 'bearer' })
    //     .send(commentCreatingData);
    //
    //   expect(result.status).toBe(201);
    //   expect(result.body).toEqual(createdComment);
    // });
    //
    // it(`Blogger gets all comments for blog`, async () => {
    //   const result = await request(app.getHttpServer())
    //     .get('/blogger/blogs/comments')
    //     .auth(accessToken[0], { type: 'bearer' });
    //   expect(result.status).toBe(200);
    //   expect(result.body).toEqual(commentForBloggerWithPagination);
    // });
    //
    // it(`Banning user`, async () => {
    //   const result = await request(app.getHttpServer())
    //     .put(`/blogger/users/${users[1].id}/ban`)
    //     .auth(accessToken[0], { type: 'bearer' })
    //     .send({
    //       isBanned: true,
    //       banReason: 'bad words that not acceptable',
    //       blogId: blog[0].id,
    //     });
    //   expect(result.status).toBe(204);
    // });
    //
    // it(`Blogger gets all comments for blog`, async () => {
    //   const result = await request(app.getHttpServer())
    //     .get('/blogger/blogs/comments')
    //     .auth(accessToken[0], { type: 'bearer' });
    //   expect(result.status).toBe(200);
    //   expect(result.body).toEqual(commentForBloggerWithPagination);
    // });
    //
    // it(`Sending wallpaper image for blog`, async () => {
    //   const imagePath = join(__dirname, 'wallpaper_1028_312.jpg');
    //   const blogId = blog[0].id;
    //
    //   //console.log(imagePath);
    //
    //   const result = await request(app.getHttpServer())
    //     .post(`/blogger/blogs/${blogId}/images/wallpaper`)
    //     .set('Authorization', `Bearer ${accessToken[0]}`)
    //     .attach('file', imagePath);
    //
    //   //console.log(result.body);
    //   expect(result.status).toBe(201);
    //
    //   // await new Promise((resolve) => setTimeout(resolve, 5000));
    // });
    //
    // it(`Sending main image for blog`, async () => {
    //   const imagePath = join(__dirname, 'wallpaper_156_156.jpg');
    //   const blogId = blog[0].id;
    //
    //   //console.log(imagePath);
    //
    //   const result = await request(app.getHttpServer())
    //     .post(`/blogger/blogs/${blogId}/images/main`)
    //     .set('Authorization', `Bearer ${accessToken[0]}`)
    //     .attach('file', imagePath);
    //
    //   //console.log(result.body);
    //   expect(result.status).toBe(201);
    //
    //   // await new Promise((resolve) => setTimeout(resolve, 5000));
    // });
    //
    // it(`Get posts by blogId`, async () => {
    //   const result = await request(app.getHttpServer()).get(
    //     `/blogs/${blog[0].id}`,
    //   );
    //   //.auth(accessToken[0], { type: 'bearer' });
    //
    //   //console.log(result.body.images.main);
    //   expect(result.status).toBe(200);
    // });
    //
    // it(`Get blogs`, async () => {
    //   const result = await request(app.getHttpServer()).get(`/blogs`);
    //   //.auth(accessToken[0], { type: 'bearer' });
    //
    //   console.log(result.body.items[0].images);
    //   console.log(result.body.items[1].images);
    //   expect(result.status).toBe(200);
    // });
    //
    // it(`Blogger delete blog by id`, async () => {
    //   const blogBeforeDelete = await getBlogById(httpServer, blog[0].id);
    //
    //   expect(blogBeforeDelete.body.name).toEqual('Blog updated');
    //
    //   const result = await deleteBlogById(
    //     httpServer,
    //     blog[0].id,
    //     accessToken[0],
    //   );
    //   expect(result.status).toBe(204);
    //
    //   const blogAfterDelete = await getBlogById(httpServer, blog[0].id);
    //   expect(blogAfterDelete.body.name).toBeUndefined();
    // });
  });
});

//TODO get all comments for all posts inside all current user blogs
