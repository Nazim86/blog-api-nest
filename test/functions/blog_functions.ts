import request from 'supertest';
import { banBlogDto } from '../data/blogs-data';

export const banBlog = async (httpServer, blodId) => {
  return request(httpServer)
    .post(`/sa/blogs/${blodId}`)
    .auth('admin', 'qwerty')
    .send(banBlogDto);
};

// export const;
