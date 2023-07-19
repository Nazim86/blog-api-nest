import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../../../src/app.module';
import { appSettings } from '../../../../src/app.settings';
import request from 'supertest';
import { blogCreatingData } from '../../../data/blogs-data';
import { newPostCreatingData } from '../../../data/posts-data';
import {
  commentCreatingData,
  commentWithPagination,
} from '../../../data/comments-data';
import { creatingUser } from '../../../functions/user_functions';
import { createUserDto } from '../../../data/user-data';
import { DataSource } from 'typeorm';
import {
  dislikePost,
  getPostById,
  getPosts,
  likePost,
  setNonePost,
} from '../../../functions/post_functions';
import { LikeEnum } from '../../../../src/api/public/like/like.enum';

describe('Public posts testing', () => {
  let app: INestApplication;
  let httpServer;
  let dataSource: DataSource;
  const users = [];
  const blogs = [];
  const accessTokens = [];
  const posts = [];
  const comments = [];

  const countOfUsers = 5;
  const postCounts = 5;

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

  describe('Creating comment, updating like status of post, return comments to post, return all posts and post by id', () => {
    it('should wipe all data in db', async () => {
      const response = await request(httpServer).delete('/testing/all-data');
      expect(response.status).toBe(204);
    });

    it(`Creating user`, async () => {
      for (let i = 0; i <= countOfUsers; i++) {
        const user = await creatingUser(httpServer, {
          ...createUserDto,
          login: `leo${i}`,
          email: `nazim86mammadov${i}@yandex.ru`,
        });
        expect(user.status).toBe(201);
        expect(user.body.login).toEqual(`leo${i}`);
        expect(user.body.email).toEqual(`nazim86mammadov${i}@yandex.ru`);
        users.push(user.body);
      }
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
      for (let i = 0; i <= postCounts; i++) {
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
      const result = await request(app.getHttpServer())
        .post(`/posts/${posts[0].id}/comments`)
        .auth(accessTokens[0], { type: 'bearer' })
        .send({ content: `${commentCreatingData.content} + ${0}` });

      comments.push(result.body);

      expect(result.status).toBe(201);
      expect(result.body.content).toEqual(
        `${commentCreatingData.content} + ${0}`,
      );
    });

    it(`Get comment by post id and return 200 `, async () => {
      const result = await request(httpServer)
        .get(`/posts/${posts[0].id}/comments`)
        .auth(accessTokens[0], { type: 'bearer' })
        .send();

      expect(result.status).toBe(200);
      expect(result.body).toEqual({
        ...commentWithPagination,
        items: [
          {
            ...commentWithPagination.items[0],
            content: 'Learning to code in IT incubator + 0',
          },
        ],
      });
    });

    it(`like the post by user 0, user 1, user 2, user 3, user 4, user 5 get the post after each like by user 1. 
    NewestLikes should be sorted in descending and return 204`, async () => {
      for (let i = 0; i <= 5; i++) {
        const postId = posts[0].id;

        await likePost(httpServer, postId, [accessTokens[i]]);
        const post = await getPostById(httpServer, postId, accessTokens[0]);
        expect(post.body.extendedLikesInfo.likesCount).toBe(i + 1);

        if (i === 0) {
          expect(post.body.extendedLikesInfo.myStatus).toBe(LikeEnum.Like);
        }

        if (i === 1) {
          expect(post.body.extendedLikesInfo.myStatus).toBe(LikeEnum.Like);
        }

        if (i === 2) {
          expect(post.body.extendedLikesInfo.myStatus).toBe(LikeEnum.Like);
        }

        if (i === 3) {
          expect(post.body.extendedLikesInfo.myStatus).toBe(LikeEnum.Like);
        }

        if (i === 5) {
          expect(post.body.extendedLikesInfo.myStatus).toBe(LikeEnum.Like);
          expect(post.body.extendedLikesInfo.newestLikes[0].login).toEqual(
            'leo5',
          );
          expect(post.body.extendedLikesInfo.newestLikes[1].login).toEqual(
            'leo4',
          );

          expect(post.body.extendedLikesInfo.newestLikes[2].login).toEqual(
            'leo3',
          );
        }
      }
    });

    it(`should reset commentsLike repository `, async () => {
      await dataSource.query(`
      truncate  post_like
      `);
    });

    it(`dislike the post by user 1, user 2; like the post by user 3; 
    get the post after each like by user 1; status 204; `, async () => {
      const postId = posts[0].id;
      await dislikePost(httpServer, postId, [accessTokens[0], accessTokens[1]]);
      let post = await getPostById(httpServer, postId, accessTokens[0]);

      expect(post.body.extendedLikesInfo.likesCount).toBe(0);
      expect(post.body.extendedLikesInfo.dislikesCount).toBe(2);
      expect(post.body.extendedLikesInfo.myStatus).toBe(LikeEnum.Dislike);

      await likePost(httpServer, postId, [accessTokens[2]]);

      post = await getPostById(httpServer, postId, accessTokens[0]);

      expect(post.body.extendedLikesInfo.likesCount).toBe(1);
      expect(post.body.extendedLikesInfo.dislikesCount).toBe(2);
      expect(post.body.extendedLikesInfo.myStatus).toBe(LikeEnum.Dislike);
    });

    it(`should reset commentsLike repository `, async () => {
      await dataSource.query(`
      truncate  post_like
      `);
    });

    it(`like the post twice by user 1; get the post after each like by user 1. 
    Should increase like's count once; status 204 `, async () => {
      const postId = posts[0].id;
      await likePost(httpServer, postId, [accessTokens[0], accessTokens[0]]);

      const post = await getPostById(httpServer, postId, accessTokens[0]);

      expect(post.body.extendedLikesInfo.likesCount).toBe(1);
      expect(post.body.extendedLikesInfo.dislikesCount).toBe(0);
      expect(post.body.extendedLikesInfo.myStatus).toBe(LikeEnum.Like);
    });

    it(`should reset commentsLike repository `, async () => {
      await dataSource.query(`
      truncate  post_like
      `);
    });

    it(`like the post by user 1; dislike the post by user 1; set 'none' status by user 1; 
      get the post after each like by user 1; status 204; `, async () => {
      const postId = posts[0].id;
      await likePost(httpServer, postId, [accessTokens[0]]);

      let post = await getPostById(httpServer, postId, accessTokens[0]);

      expect(post.body.extendedLikesInfo.likesCount).toBe(1);
      expect(post.body.extendedLikesInfo.dislikesCount).toBe(0);
      expect(post.body.extendedLikesInfo.myStatus).toBe(LikeEnum.Like);

      await dislikePost(httpServer, postId, [accessTokens[0]]);

      post = await getPostById(httpServer, postId, accessTokens[0]);

      expect(post.body.extendedLikesInfo.likesCount).toBe(0);
      expect(post.body.extendedLikesInfo.dislikesCount).toBe(1);
      expect(post.body.extendedLikesInfo.myStatus).toBe(LikeEnum.Dislike);

      await setNonePost(httpServer, postId, [accessTokens[0]]);

      post = await getPostById(httpServer, postId, accessTokens[0]);

      expect(post.body.extendedLikesInfo.likesCount).toBe(0);
      expect(post.body.extendedLikesInfo.dislikesCount).toBe(0);
      expect(post.body.extendedLikesInfo.myStatus).toBe(LikeEnum.None);
    });

    it(`should reset commentsLike repository `, async () => {
      await dataSource.query(`
      truncate  post_like
      `);
    });

    it(`like the post by user 1 then get by user 2; 
    dislike the post by user 2 then get by the user 1; status 204; `, async () => {
      const postId = posts[0].id;
      await likePost(httpServer, postId, [accessTokens[0]]);

      let post = await getPostById(httpServer, postId, accessTokens[1]);

      expect(post.body.extendedLikesInfo.likesCount).toBe(1);
      expect(post.body.extendedLikesInfo.dislikesCount).toBe(0);
      expect(post.body.extendedLikesInfo.myStatus).toBe(LikeEnum.None);

      await dislikePost(httpServer, postId, [accessTokens[1]]);

      post = await getPostById(httpServer, postId, accessTokens[0]);

      expect(post.body.extendedLikesInfo.likesCount).toBe(1);
      expect(post.body.extendedLikesInfo.dislikesCount).toBe(1);
      expect(post.body.extendedLikesInfo.myStatus).toBe(LikeEnum.Like);
    });

    it(`should reset commentsLike repository `, async () => {
      await dataSource.query(`
      truncate  post_like
      `);
    });

    it(`like post 1 by user 1, user 2; like post 2 by user 2, user 3; dislike post 3 by user 1; 
    like post 4 by user 1, user 4, user 2, user 3; like post 5 by user 2, dislike by user 3; 
    like post 6 by user 1, dislike by user 2. 
    Get the posts by user 1 after all likes NewestLikes should be sorted in descending`, async () => {
      for (let i = 0; i < posts.length; i++) {
        const postId = posts[i].id;
        if (i === 0) {
          await likePost(httpServer, postId, [
            accessTokens[0],
            accessTokens[1],
          ]);
        }

        if (i === 1) {
          await likePost(httpServer, postId, [
            accessTokens[1],
            accessTokens[2],
          ]);
        }

        if (i === 2) {
          await dislikePost(httpServer, postId, [accessTokens[0]]);
        }

        if (i === 3) {
          await likePost(httpServer, postId, [
            accessTokens[1],
            accessTokens[4],
            accessTokens[2],
            accessTokens[3],
          ]);
        }

        if (i === 4) {
          await likePost(httpServer, postId, [accessTokens[1]]);
          await dislikePost(httpServer, postId, [accessTokens[2]]);
        }

        if (i === 5) {
          await likePost(httpServer, postId, [accessTokens[0]]);
          await dislikePost(httpServer, postId, [accessTokens[1]]);
        }
      }

      const allPosts = await getPosts(httpServer);

      //newestLikes test
      expect(
        allPosts.body.items[2].extendedLikesInfo.newestLikes[0].login,
      ).toEqual('leo3');

      expect(
        allPosts.body.items[2].extendedLikesInfo.newestLikes[1].login,
      ).toEqual('leo2');

      expect(
        allPosts.body.items[2].extendedLikesInfo.newestLikes[2].login,
      ).toEqual('leo4');

      //getting all comments after likes, checking likesCount and status
      for (let i = 0; i < allPosts.body.items.length; i++) {
        const postId = allPosts.body.items[i].id;
        const post = allPosts.body.items.find((p) => p.id === postId);

        if (i === 5) {
          expect(post.extendedLikesInfo.likesCount).toBe(2);
          expect(post.extendedLikesInfo.dislikesCount).toBe(0);
          expect(post.extendedLikesInfo.myStatus).toBe(LikeEnum.None);
        }

        if (i === 4) {
          expect(post.extendedLikesInfo.likesCount).toBe(2);
          expect(post.extendedLikesInfo.dislikesCount).toBe(0);
          expect(post.extendedLikesInfo.myStatus).toBe(LikeEnum.None);
        }

        if (i === 3) {
          expect(post.extendedLikesInfo.likesCount).toBe(0);
          expect(post.extendedLikesInfo.dislikesCount).toBe(1);
          expect(post.extendedLikesInfo.myStatus).toBe(LikeEnum.None);
        }

        if (i === 2) {
          expect(post.extendedLikesInfo.likesCount).toBe(4);
          expect(post.extendedLikesInfo.dislikesCount).toBe(0);
          expect(post.extendedLikesInfo.myStatus).toBe(LikeEnum.None);
        }

        if (i === 1) {
          expect(post.extendedLikesInfo.likesCount).toBe(1);
          expect(post.extendedLikesInfo.dislikesCount).toBe(1);
          expect(post.extendedLikesInfo.myStatus).toBe(LikeEnum.None);
        }

        if (i === 0) {
          expect(post.extendedLikesInfo.likesCount).toBe(1);
          expect(post.extendedLikesInfo.dislikesCount).toBe(1);
          expect(post.extendedLikesInfo.myStatus).toBe(LikeEnum.None);
        }
      }
    });
  });
});
