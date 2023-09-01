import request from 'supertest';
import { nonePostDto, postDislikeDto, postLikeDto } from '../data/posts-data';

export const likePost = async (httpServer, postId, accessTokens) => {
  for (const token of accessTokens) {
    await request(httpServer)
      .put(`/posts/${postId}/like-status`)
      .auth(token, { type: 'bearer' })
      .send(postLikeDto);
  }
  return;
};

export const dislikePost = async (httpServer, postId, accessTokens) => {
  for (const token of accessTokens) {
    await request(httpServer)
      .put(`/posts/${postId}/like-status`)
      .auth(token, { type: 'bearer' })
      .send(postDislikeDto);
  }
  return;
};

export const setNonePost = async (httpServer, postId, accessTokens) => {
  for (const token of accessTokens) {
    await request(httpServer)
      .put(`/posts/${postId}/like-status`)
      .auth(token, { type: 'bearer' })
      .send(nonePostDto);
  }
  return;
};

export const getPostById = async (httpServer, postId, accessToken) => {
  return request(httpServer)
    .get(`/posts/${postId}`)
    .auth(accessToken, { type: 'bearer' })
    .send();
};

export const getPostsByBlogIdPublic = async (
  httpServer,
  blogId,
  accessToken,
  query?,
) => {
  return request(httpServer)
    .get(`/blogs/${blogId}/posts`)
    .auth(accessToken, { type: 'bearer' })
    .send(query);
};

export const getPostsByBlogIdBlogger = async (
  httpServer,
  blogId,
  accessToken,
  query?,
) => {
  return request(httpServer)
    .get(`/blogger/blogs/${blogId}/posts`)
    .auth(accessToken, { type: 'bearer' })
    .send(query);
};

export const getPosts = async (httpServer, accessToken, query?) => {
  return request(httpServer)
    .get(`/posts`)
    .query(query)
    .auth(accessToken, { type: 'bearer' })
    .send(query);

  //   expect(result.body.items[4].extendedLikesInfo.likesCount).toBe(i + 1);
  // expect(result.body.items[4].extendedLikesInfo.newestLikes[0].login).toEqual(
  //   users[i].login,
  // );
};
