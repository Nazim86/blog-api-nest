import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../../src/app.module';
import { appSettings } from '../../../src/app.settings';
import request from 'supertest';
import { blogCreatingData } from '../../data/blogs-data';
import { newPostCreatingData } from '../../data/posts-data';
import {
  commentCreatingData,
  commentUpdatingData,
  dislikeComment,
  likeComment,
} from '../../data/comments-data';

describe('Public comments testing', () => {
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

  describe('Updating comment, like comment, delete comment, get comment by id', () => {
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

    it(`Public update comment by id and return 204 `, async () => {
      const result = await request(httpServer)
        .put(`/comments/${comments[5].id}`)
        .auth(accessTokens[5], { type: 'bearer' })
        .send(commentUpdatingData);

      expect(result.status).toBe(204);
    });

    it(`Should get myStatus "None" after like comment and get with unauthorized user return 204 `, async () => {
      const result = await request(httpServer)
        .put(`/comments/${comments[5].id}/like-status`)
        .auth(accessTokens[5], { type: 'bearer' })
        .send(likeComment);

      const getComment = await request(httpServer)
        .get(`/comments/${comments[5].id}`)
        .send();

      expect(result.status).toBe(204);
      expect(getComment.body.likesInfo.myStatus).toEqual('None');
      expect(getComment.body.likesInfo.likesCount).toBe(1);
    });

    it(`Should get myStatus "Like" after like comment and get with unauthorized user return 204 `, async () => {
      const result = await request(httpServer)
        .put(`/comments/${comments[5].id}/like-status`)
        .auth(accessTokens[5], { type: 'bearer' })
        .send(likeComment);

      const getComment = await request(httpServer)
        .get(`/comments/${comments[5].id}`)
        .auth(accessTokens[5], { type: 'bearer' })
        .send();

      expect(result.status).toBe(204);
      expect(getComment.body.likesInfo.myStatus).toEqual('Like');
      expect(getComment.body.likesInfo.likesCount).toBe(1);
    });

    it(`like the comment by user 1, user 2, user 3, user 4. get the comment after each like by user 1. status 204 `, async () => {
      for (let i = 0; i <= 5; i++) {
        const result = await request(httpServer)
          .put(`/comments/${comments[0].id}/like-status`)
          .auth(accessTokens[i], { type: 'bearer' })
          .send(likeComment);

        const getComment = await request(httpServer)
          .get(`/comments/${comments[0].id}`)
          .auth(accessTokens[0], { type: 'bearer' })
          .send();

        expect(result.status).toBe(204);
        expect(getComment.body.likesInfo.myStatus).toEqual('Like');
        expect(getComment.body.likesInfo.likesCount).toBe(i + 1);
      }
    });

    it(`dislike the comment by user 1, user 2; like the comment by user 3; get the comment after each like by user 1; status 204 `, async () => {
      for (let i = 0; i <= 5; i++) {
        const result = await request(httpServer)
          .put(`/comments/${comments[0].id}/like-status`)
          .auth(accessTokens[i], { type: 'bearer' })
          .send(dislikeComment);

        const getComment = await request(httpServer)
          .get(`/comments/${comments[0].id}`)
          .auth(accessTokens[0], { type: 'bearer' })
          .send();

        expect(result.status).toBe(204);
        expect(getComment.body.likesInfo.myStatus).toEqual('Dislike');
        expect(getComment.body.likesInfo.likesCount).toBe(5 - i);
        expect(getComment.body.likesInfo.dislikesCount).toBe(i + 1);
      }
    });

    it(`like the comment twice by user 1; get the comment after each like by user 1. Should increase like's count once; status 204 `, async () => {
      for (let i = 0; i <= 1; i++) {
        const result = await request(httpServer)
          .put(`/comments/${comments[4].id}/like-status`)
          .auth(accessTokens[0], { type: 'bearer' })
          .send(likeComment);

        const getComment = await request(httpServer)
          .get(`/comments/${comments[4].id}`)
          .auth(accessTokens[0], { type: 'bearer' })
          .send();

        expect(result.status).toBe(204);
        expect(getComment.body.likesInfo.myStatus).toEqual('Like');
        expect(getComment.body.likesInfo.likesCount).toBe(1);
      }
    });
  });
});
