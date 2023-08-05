import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../../../src/app.module';
import { appSettings } from '../../../../src/app.settings';
import request from 'supertest';
import { blogCreatingData } from '../../../data/blogs-data';
import { newPostCreatingData } from '../../../data/posts-data';
import {
  commentCreatingData,
  commentUpdatingData,
  dislikeCommentDto,
  likeCommentDto,
} from '../../../data/comments-data';
import { DataSource } from 'typeorm';
import {
  dislikeComment,
  getCommentById,
  getCommentsByPostId,
  likeComment,
} from '../../../functions/comment_functions';
import { LikeEnum } from '../../../../src/api/public/like/like.enum';

describe('Public comments testing', () => {
  let app: INestApplication;
  let httpServer;
  const users = [];
  const blogs = [];
  const accessTokens = [];
  const posts = [];
  const comments = [];

  let dataSource: DataSource;
  jest.setTimeout(60 * 1000);
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app = appSettings(app);

    await app.init();

    httpServer = app.getHttpServer();
    dataSource = app.get(DataSource);
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
      const result = await request(app.getHttpServer())
        .post('/blogger/blogs')
        .auth(accessTokens[0], { type: 'bearer' })
        .send({ ...blogCreatingData, name: `Blog User${0}` });

      blogs.push(result.body);
      expect(result.status).toBe(201);

      expect(blogs[0].name).toEqual('Blog User0');
    });

    it(`Blogger creates post for blog and return 201`, async () => {
      const result = await request(app.getHttpServer())
        .post(`/blogger/blogs/${blogs[0].id}/posts`)
        .auth(accessTokens[0], { type: 'bearer' })
        .send({
          ...newPostCreatingData,
          title: `ChatGPT${0}`,
          content: `About Ai technologies${0}`,
        });
      posts.push(result.body);
      expect(result.status).toBe(201);
      expect(result.body.title).toEqual(`ChatGPT${0}`);
    });

    it(`Public creates comments for post and return 201`, async () => {
      for (let i = 0; i <= 5; i++) {
        const result = await request(app.getHttpServer())
          .post(`/posts/${posts[0].id}/comments`)
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
        .send(likeCommentDto);

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
        .send(likeCommentDto);

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
          .send(likeCommentDto);

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
          .send(dislikeCommentDto);

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
          .send(likeCommentDto);

        const getComment = await request(httpServer)
          .get(`/comments/${comments[4].id}`)
          .auth(accessTokens[0], { type: 'bearer' })
          .send();

        expect(result.status).toBe(204);
        expect(getComment.body.likesInfo.myStatus).toEqual('Like');
        expect(getComment.body.likesInfo.likesCount).toBe(1);
      }
    });

    it(`like the comment by user 1 then get by user 2; dislike the comment by user 2 then get by the user 1; status 204 `, async () => {
      const result = await request(httpServer)
        .put(`/comments/${comments[2].id}/like-status`)
        .auth(accessTokens[0], { type: 'bearer' })
        .send(likeCommentDto);

      const getComment = await request(httpServer)
        .get(`/comments/${comments[2].id}`)
        .auth(accessTokens[1], { type: 'bearer' })
        .send();

      expect(result.status).toBe(204);
      expect(getComment.body.likesInfo.myStatus).toEqual('None');
      expect(getComment.body.likesInfo.likesCount).toBe(1);

      //TODO rest of test
    });

    // below is new bundle of tests
    //
    it(`should reset commentsLike repository `, async () => {
      await dataSource.query(`
      delete  from comment_like
      `);
    });

    it(`like comment 1 by user 1, user 2; like comment 2 by user 2, user 3;
       status 204; content: `, async () => {
      for (let i = 0; i <= 1; i++) {
        await likeComment(httpServer, comments[0].id, [
          accessTokens[0],
          accessTokens[1],
        ]);

        await likeComment(httpServer, comments[1].id, [
          accessTokens[1],
          accessTokens[2],
        ]);

        const comment1 = await getCommentById(
          httpServer,
          comments[0].id,
          accessTokens[0],
        );

        const comment2 = await getCommentById(
          httpServer,
          comments[1].id,
          accessTokens[0],
        );

        expect(comment1.body.likesInfo.myStatus).toBe(LikeEnum.Like);
        expect(comment1.body.likesInfo.likesCount).toBe(2);
        expect(comment1.body.likesInfo.dislikesCount).toBe(0);

        expect(comment2.body.likesInfo.myStatus).toBe(LikeEnum.None);
        expect(comment2.body.likesInfo.likesCount).toBe(2);
        expect(comment2.body.likesInfo.dislikesCount).toBe(0);
      }
    });

    it(`dislike comment 3 by user 1;  status 204; content: `, async () => {
      await request(httpServer)
        .put(`/comments/${comments[2].id}/like-status`)
        .auth(accessTokens[0], { type: 'bearer' })
        .send(likeCommentDto)
        .expect(204);

      const getComment = await request(httpServer)
        .get(`/comments/${comments[2].id}`)
        .auth(accessTokens[0], { type: 'bearer' })
        .send();

      expect(getComment.body.likesInfo.myStatus).toEqual('Like');
      expect(getComment.body.likesInfo.likesCount).toBe(1);
    });

    it(`like comment 4 by user 1, user 4, user 2, user 3; like comment 5 by user 2, dislike by user 3; 
    like comment 6 by user 1, dislike by user 2. Get the comments by user 1 after all likes ; status 200 `, async () => {
      for (let i = 0; i <= 3; i++) {
        await request(httpServer)
          .put(`/comments/${comments[3].id}/like-status`)
          .auth(accessTokens[i], { type: 'bearer' })
          .send(likeCommentDto)
          .expect(204);

        const getComment = await request(httpServer)
          .get(`/comments/${comments[3].id}`)
          .auth(accessTokens[i], { type: 'bearer' })
          .send();

        expect(getComment.body.likesInfo.myStatus).toEqual('Like');
        expect(getComment.body.likesInfo.likesCount).toBe(i + 1);
      }
    });

    it(`should reset commentsLike repository `, async () => {
      await dataSource.query(`
      delete  from comment_like
      `);
    });

    it(`like comment 5 by user 2, dislike by user 3; 
    like comment 6 by user 1, dislike by user 2. Get the comments by user 1 after all likes ; status 200 `, async () => {
      await likeComment(httpServer, comments[4].id, [accessTokens[1]]);
      await dislikeComment(httpServer, comments[4].id, [accessTokens[2]]);

      await likeComment(httpServer, comments[5].id, [accessTokens[0]]);
      await dislikeComment(httpServer, comments[5].id, [accessTokens[1]]);

      const comment5 = await getCommentById(
        httpServer,
        comments[4].id,
        accessTokens[0],
      );
      const comment6 = await getCommentById(
        httpServer,
        comments[5].id,
        accessTokens[0],
      );

      expect(comment5.body.likesInfo.myStatus).toEqual('None');
      expect(comment5.body.likesInfo.likesCount).toBe(1);
      expect(comment5.body.likesInfo.dislikesCount).toBe(1);

      expect(comment6.body.likesInfo.myStatus).toEqual('Like');
      expect(comment6.body.likesInfo.likesCount).toBe(1);
      expect(comment6.body.likesInfo.dislikesCount).toBe(1);
    });

    it(`should reset commentsLike repository `, async () => {
      await dataSource.query(`
      delete  from comment_like
      `);
    });

    it(`like comment 1 by user 1, user 2; like comment 2 by user 2, user 3; 
    dislike comment 3 by user 1; like comment 4 by user 1, user 4, user 2, user 3; 
    like comment 5 by user 2, dislike by user 3; like comment 6 by user 1, dislike by user 2. 
    Get the comments by user 1 after all likes ; status 200 `, async () => {
      for (let i = 0; i < comments.length; i++) {
        const commentId = comments[i].id;

        if (i === 0) {
          await likeComment(httpServer, commentId, [
            accessTokens[0],
            accessTokens[1],
          ]);
        }

        if (i === 1) {
          await likeComment(httpServer, commentId, [
            accessTokens[1],
            accessTokens[2],
          ]);
        }

        if (i === 2) {
          await dislikeComment(httpServer, commentId, [accessTokens[0]]);
        }

        if (i === 3) {
          await likeComment(httpServer, commentId, [
            accessTokens[0],
            accessTokens[3],
            accessTokens[1],
            accessTokens[2],
          ]);
        }

        if (i === 4) {
          await likeComment(httpServer, commentId, [accessTokens[1]]);

          await dislikeComment(httpServer, commentId, [accessTokens[2]]);
        }

        if (i === 5) {
          await likeComment(httpServer, commentId, [accessTokens[0]]);

          await dislikeComment(httpServer, commentId, [accessTokens[1]]);
        }
      }

      const allComments = await getCommentsByPostId(
        httpServer,
        posts[0].id,
        accessTokens[0],
      );
      // console.log('allComments', allComments.body.items);
      // console.log('allComments', allComments.body.items.likesInfo);

      for (let i = 0; i < allComments.body.items.length; i++) {
        const commentId = allComments.body.items[i].id;

        const comment = allComments.body.items.find((c) => c.id === commentId);

        if (i === 0) {
          expect(comment.likesInfo.myStatus).toBe(LikeEnum.Like);
          expect(comment.likesInfo.likesCount).toBe(2);
          expect(comment.likesInfo.dislikesCount).toBe(0);
        }

        if (i === 1) {
          expect(comment.likesInfo.myStatus).toBe(LikeEnum.None);
          expect(comment.likesInfo.likesCount).toBe(1);
          expect(comment.likesInfo.dislikesCount).toBe(0);
        }

        if (i === 2) {
          expect(comment.likesInfo.myStatus).toBe(LikeEnum.Dislike);
          expect(comment.likesInfo.likesCount).toBe(0);
          expect(comment.likesInfo.dislikesCount).toBe(1);
        }

        if (i === 3) {
          expect(comment.likesInfo.myStatus).toBe(LikeEnum.Like);
          expect(comment.likesInfo.likesCount).toBe(4);
          expect(comment.likesInfo.dislikesCount).toBe(0);
        }

        if (i === 4) {
          expect(comment.likesInfo.myStatus).toBe(LikeEnum.None);
          expect(comment.likesInfo.likesCount).toBe(1);
          expect(comment.likesInfo.dislikesCount).toBe(1);
        }

        if (i === 5) {
          expect(comment.likesInfo.myStatus).toBe(LikeEnum.Like);
          expect(comment.likesInfo.likesCount).toBe(1);
          expect(comment.likesInfo.dislikesCount).toBe(1);
        }
      }
    });

    it(`should delete comment by id; status 204 `, async () => {
      const result = await request(httpServer)
        .delete(`/comments/${comments[5].id}`)
        .auth(accessTokens[5], { type: 'bearer' })
        .send();
      expect(result.status).toBe(204);

      const allComments = await getCommentsByPostId(
        httpServer,
        posts[0].id,
        accessTokens[0],
      );

      expect(allComments.body.items.length).toBe(5);
    });

    // it(`should return status 200; content: all comments for all posts inside all current user blogs with pagination;
    // used additional methods `, async () => {
    //   const result = await request(httpServer)
    //     .get(`/blogger/blogs/comments`)
    //     .auth(accessTokens[0], { type: 'bearer' })
    //     .send();
    //
    // });
  });
});
