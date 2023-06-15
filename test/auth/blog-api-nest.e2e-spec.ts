// import { Test, TestingModule } from '@nestjs/testing';
// import request from 'supertest';
// import { MongoMemoryServer } from 'mongodb-memory-server';
// import * as mongoose from 'mongoose';
// import { AppModule } from '../../src/app.module';
//
// describe('Blogger', () => {
//   let app: any;
//   let moduleFixture: TestingModule;
//   let mongod: MongoMemoryServer;
//
//   beforeAll(async () => {
//     mongod = await MongoMemoryServer.create();
//     const mongoUri = mongod.getUri();
//
//     moduleFixture = await Test.createTestingModule({
//       imports: [AppModule],
//     }).compile();
//
//     app = moduleFixture.createNestApplication();
//     await app.init();
//
//     await mongoose.connect(mongoUri);
//   });
//
//   afterAll(async () => {
//     await mongoose.disconnect();
//     await mongod.stop();
//     await app.close();
//     await moduleFixture.close();
//   });
//   describe('Blogger blog creation', () => {
//     it('Creating user', async () => {
//       await request(app.getHttpServer()).post('/sa/users').expect(204);
//     });
//   });
// });

import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';

import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../mongoose-test-module';
import {
  blogCreatingData,
  createdBlogWithoutPagination,
  createdBlogWithPagination,
} from '../data/blogs-data';

describe('Super Admin blogs testing', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [rootMongooseTestModule(), AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await closeInMongodConnection();
  });

  describe('Creating user,blog,binding,banning ', () => {
    let accessToken;
    let blog;
    it(`Creating user`, () => {
      return request(app.getHttpServer())
        .post('/sa/users')
        .auth('admin', 'qwerty')
        .send({
          login: 'leo',
          password: '123456',
          email: 'leo@mail.ru',
        })
        .expect(201);
    });

    it(`User login`, async () => {
      const result = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          loginOrEmail: 'leo',
          password: '123456',
        });
      expect(result.status).toBe(200);
      accessToken = result.body.accessToken;
    });

    it(`Blogger creates blog`, async () => {
      const result = await request(app.getHttpServer())
        .post('/blogger/blogs')
        .auth(accessToken, { type: 'bearer' })
        .send(blogCreatingData);

      blog = result.body;
      expect(result.status).toBe(201);
      expect(result.body).toEqual(createdBlogWithoutPagination);
    });

    it(`Banning blog`, async () => {
      const result = await request(app.getHttpServer())
        .put(`/sa/blogs/${blog.id}/ban`)
        .auth('admin', 'qwerty')
        .send({
          isBanned: true,
        });
      console.log(result.body);
      expect(result.status).toBe(200);
    });

    it(`Get Blogger blogs`, async () => {
      const result = await request(app.getHttpServer())
        .get('/blogger/blogs')
        .auth(accessToken, { type: 'bearer' });

      expect(result.status).toBe(200);
      expect(result.body).toEqual(createdBlogWithPagination);
    });
  });
});
