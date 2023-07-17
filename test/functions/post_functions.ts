import request from 'supertest';
import { postDislikeDto, postLikeDto } from '../data/posts-data';

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

export const getPostById = async (httpServer, postId, accessToken) => {
  return request(httpServer)
    .get(`/posts/${postId}`)
    .auth(accessToken, { type: 'bearer' })
    .send();
};

export const getPosts = async (httpServer, query?) => {
  return request(httpServer).get(`/posts`).query(query).send(query);

  //   expect(result.body.items[4].extendedLikesInfo.likesCount).toBe(i + 1);
  // expect(result.body.items[4].extendedLikesInfo.newestLikes[0].login).toEqual(
  //   users[i].login,
  // );
};
