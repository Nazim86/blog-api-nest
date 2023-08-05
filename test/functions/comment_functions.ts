import request from 'supertest';
import { nonePostDto, postDislikeDto, postLikeDto } from '../data/posts-data';

export const likeComment = async (httpServer, commentId, accessTokens) => {
  for (const token of accessTokens) {
    await request(httpServer)
      .put(`/comments/${commentId}/like-status`)
      .auth(token, { type: 'bearer' })
      .send(postLikeDto);
  }
  return;
};

export const dislikeComment = async (httpServer, commentId, accessTokens) => {
  for (const token of accessTokens) {
    await request(httpServer)
      .put(`/comments/${commentId}/like-status`)
      .auth(token, { type: 'bearer' })
      .send(postDislikeDto);
  }
  return;
};

export const setNonePost = async (httpServer, commentId, accessTokens) => {
  for (const token of accessTokens) {
    await request(httpServer)
      .put(`/comments/${commentId}/like-status`)
      .auth(token, { type: 'bearer' })
      .send(nonePostDto);
  }
  return;
};

export const getCommentById = async (httpServer, commentId, accessToken) => {
  return request(httpServer)
    .get(`/comments/${commentId}`)
    .auth(accessToken, { type: 'bearer' })
    .send();
};

export const getCommentsByPostId = async (httpServer, postId, accessToken) => {
  return request(httpServer)
    .get(`/posts/${postId}/comments`)
    .auth(accessToken, { type: 'bearer' })
    .send();
};
