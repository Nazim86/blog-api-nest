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
