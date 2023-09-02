import request from 'supertest';
import { banBlogDto } from '../data/blogs-data';

export const banBlog = async (httpServer, blogId) => {
  return request(httpServer)
    .put(`/sa/blogs/${blogId}/ban`)
    .auth('admin', 'qwerty')
    .send(banBlogDto);
};
export const getBlogById = async (httpServer, blogId) => {
  return request(httpServer).get(`/blogs/${blogId}`).send();
};

export const deleteBlogById = async (httpServer, blogId, accessToken) => {
  return request(httpServer)
    .delete(`/blogger/blogs/${blogId}`)
    .auth(accessToken, { type: 'bearer' })
    .send();
};
