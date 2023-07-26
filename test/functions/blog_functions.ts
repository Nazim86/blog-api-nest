// import request from "supertest";
//
// export const banBlog = sync () => {
//   const result = await request(httpServer)
//     .post('/blogger/blogs')
//     .auth(accessToken[0], { type: 'bearer' })
//     .send();

import request from 'supertest';
import { banBlogDto } from '../data/blogs-data';

export const banBlog = async (httpServer, blodId) => {
  return request(httpServer)
    .post(`/sa/blogs/${blodId}`)
    .auth('admin', 'qwerty')
    .send(banBlogDto);
};
