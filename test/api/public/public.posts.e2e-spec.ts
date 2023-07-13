import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../../src/app.module';
import { appSettings } from '../../../src/app.settings';
import request from 'supertest';
import { blogCreatingData } from '../../data/blogs-data';
import { newPostCreatingData, postLike } from '../../data/posts-data';
import {
  commentCreatingData,
  commentWithPagination,
} from '../../data/comments-data';

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

    it(`Blogger creates post for blog and return 201`, async () => {
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

    it(`Public creates comments for post and return 201`, async () => {
      for (let i = 0; i <= 5; i++) {
        const result = await request(app.getHttpServer())
          .post(`/posts/${posts[i].id}/comments`)
          .auth(accessTokens[i], { type: 'bearer' })
          .send({ content: `${commentCreatingData.content} + ${i}` });

        comments.push(result.body);

        expect(result.status).toBe(201);
        expect(result.body.content).toEqual(
          `${commentCreatingData.content} + ${i}`,
        );
      }
    });

    it(`Get comment by post id and return 200 `, async () => {
      const result = await request(httpServer)
        .get(`/posts/${posts[5].id}/comments`)
        .auth(accessTokens[5], { type: 'bearer' })
        .send();

      expect(result.status).toBe(200);
      expect(result.body).toEqual({
        ...commentWithPagination,
        items: [
          {
            ...commentWithPagination.items[0],
            content: 'Learning to code in IT incubator + 5',
          },
        ],
      });
    });

    it(`like the post by user 0, user 1, user 2, user 3, user 4, user 5 get the post after each like by user 1. 
    NewestLikes should be sorted in descending and return 204`, async () => {
      for (let i = 0; i <= 5; i++) {
        const result = await request(app.getHttpServer())
          .put(`/posts/${posts[1].id}/like-status`)
          .auth(accessTokens[i], { type: 'bearer' })
          .send(postLike);

        expect(result.status).toBe(204);

        const getPost = await request(app.getHttpServer())
          .get(`/posts/${posts[1].id}`)
          .auth(accessTokens[0], { type: 'bearer' })
          .send();

        expect(getPost.status).toBe(200);
        expect(getPost.body.extendedLikesInfo.likesCount).toBe(i + 1);
      }
    });

    it(`like post 1 by user 1, user 2; like post 2 by user 2, user 3; dislike post 3 by user 1; 
    like post 4 by user 1, user 4, user 2, user 3; like post 5 by user 2, dislike by user 3; 
    like post 6 by user 1, dislike by user 2. 
    Get the posts by user 1 after all likes NewestLikes should be sorted in descending4`, async () => {
      await request(app.getHttpServer())
        .put(`/posts/${posts[0].id}/like-status`)
        .auth(accessTokens[1], { type: 'bearer' })
        .send(postLike)
        .expect(204);

      const getPost1 = await request(app.getHttpServer())
        .get(`/posts/${posts[0].id}`)
        .auth(accessTokens[0], { type: 'bearer' })
        .send();

      expect(getPost1.status).toBe(200);
      expect(getPost1.body.extendedLikesInfo.likesCount).toBe(1);

      await request(app.getHttpServer())
        .put(`/posts/${posts[0].id}/like-status`)
        .auth(accessTokens[1], { type: 'bearer' })
        .send(postLike)
        .expect(204);

      const getPost2 = await request(app.getHttpServer())
        .get(`/posts/${posts[0].id}`)
        .auth(accessTokens[0], { type: 'bearer' })
        .send();

      console.log('extendedLikesInfo', getPost2.body.extendedLikesInfo);

      expect(
        getPost2.body.extendedLikesInfo.newestLikes[0].addedAt,
      ).toBeGreaterThan(getPost1.body.extendedLikesInfo.newestLikes[0].addedAt);

      // const result2 = await request(app.getHttpServer())
      //   .put(`/posts/${posts[0].id}/like-status`)
      //   .auth(accessTokens[i], { type: 'bearer' })
      //   .send(postLike);
      //
      // expect(result2.status).toBe(204);
      //
      // const getPost2 = await request(app.getHttpServer())
      //   .get(`/posts/${posts[1].id}`)
      //   .auth(accessTokens[0], { type: 'bearer' })
      //   .send();
      //
      // console.log(getPost2.body.extendedLikesInfo);
      // expect(getPost2.status).toBe(200);
      // expect(getPost2.body).toEqual(postStructure);
      // expect(getPost2.body.extendedLikesInfo.likesCount).toBe(i + 1);
    });
  });
});
