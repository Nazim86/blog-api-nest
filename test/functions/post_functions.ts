import request from 'supertest';

export const likePost = async (httpServer, postId, accessToken, likeDTo) => {
  return request(httpServer)
    .put(`/posts/${postId}/like-status`)
    .auth(accessToken, { type: 'bearer' })
    .send(likeDTo);
};

export const getPostById = async (httpServer, postId, accessToken) => {
  return request(httpServer)
    .get(`/posts/${postId}`)
    .auth(accessToken, { type: 'bearer' })
    .send();
};

export const getPosts = async (httpServer, query?) => {
  return request(httpServer).get(`/posts`).query(query).send(query);
};
