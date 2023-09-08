import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../../src/app.module';

import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../../mongoose-test-module';

import { createUserDto } from '../../data/user-data';
import { appSettings } from '../../../src/app.settings';
import { creatingUser } from '../../functions/user_functions';
import { createQuestion } from '../../functions/quiz_functions';
import { createQuestionDTO, questionViewModel } from '../../data/quiz-data';
import { CommandBus } from '@nestjs/cqrs';
import { CreateQuestionCommand } from '../../../src/api/superadmin/quiz/use-cases/create-question-use-case';
import { QuizQueryRepository } from '../../../src/api/infrastructure/quiz/quiz.query.repository';

describe('Super Admin quiz testing', () => {
  let app: INestApplication;
  let httpServer;
  let commandBus: CommandBus;
  let quizQueryRepository: QuizQueryRepository;
  jest.setTimeout(60 * 1000);
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [rootMongooseTestModule(), AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    app = appSettings(app);

    await app.init();

    httpServer = app.getHttpServer();

    commandBus = app.get(CommandBus);
    quizQueryRepository = app.get(QuizQueryRepository);
  });

  afterAll(async () => {
    await closeInMongodConnection();
    await app.close();
  });

  describe('Creating questions ', () => {
    let user;

    it('should wipe all data in db', async () => {
      const response = await request(httpServer).delete('/testing/all-data');
      expect(response.status).toBe(204);
    });

    it(`SA creates question, testing Create Question Use Case`, async () => {
      // const createUser = await creatingUser(httpServer, createUserDto);
      // user = createUser.body;

      const questionId = await commandBus.execute(
        new CreateQuestionCommand(createQuestionDTO),
      );

      expect(questionId).toEqual(expect.any(String));
      const question = await quizQueryRepository.getQuestionById(questionId);

      expect(question.body).toEqual('How old are you?');
      expect(question).toEqual(questionViewModel);

      const createQuestione2e = await createQuestion(
        httpServer,
        createQuestionDTO,
      );

      expect(createQuestione2e.status).toBe(201);
      expect(createQuestione2e.body).toEqual(questionViewModel);
    });
    //
    // it(`Banning blog`, async () => {
    //   const result = await request(app.getHttpServer())
    //     .put(`/sa/blogs/${blog.id}/ban`)
    //     .auth('admin', 'qwerty')
    //     .send({
    //       isBanned: true,
    //     });
    //   expect(result.status).toBe(200);
    // });
    //
    // it(`Does not show banned blogs in public api`, async () => {
    //   const result = await request(app.getHttpServer()).get(`/blogs`);
    //   expect(result.status).toBe(200);
    //   expect(result.body).toEqual(emptyBlogDataWithPagination);
    // });
    //
    // it(`Does not show banned blogById in public api`, async () => {
    //   const result = await request(app.getHttpServer()).get(
    //     `/blogs/${blog.id}`,
    //   );
    //   expect(result.status).toBe(404);
    // });
    //
    // it(`Super Admin get all (banned or unbanned) blogs with pagination`, async () => {
    //   const result = await request(app.getHttpServer())
    //     .get('/sa/blogs')
    //     .auth('admin', 'qwerty');
    //
    //   console.log('blog in test', result.body);
    //   expect(result.status).toBe(200);
    //   expect(result.body).toEqual(createdBlogWithPaginationForSa);
    // });
    //
    // it(`Unbanning blog`, async () => {
    //   const result = await request(app.getHttpServer())
    //     .put(`/sa/blogs/${blog.id}/ban`)
    //     .auth('admin', 'qwerty')
    //     .send({
    //       isBanned: false,
    //     });
    //   expect(result.status).toBe(200);
    // });
    //
    // it(`Must show unbanned blogs in public api`, async () => {
    //   const result = await request(app.getHttpServer()).get(`/blogs`);
    //   expect(result.status).toBe(200);
    //   expect(result.body).toEqual(createdBlogWithPaginationForPublic);
    // });
    //
    // it(`After deleting user BlogOwnerInfo.login should be null`, async () => {
    //   await deleteUser(httpServer, user.id);
    //
    //   const result = await request(app.getHttpServer())
    //     .get('/sa/blogs')
    //     .auth('admin', 'qwerty');
    //   expect(result.status).toBe(200);
    //   expect(result.body).toEqual(blogWithBlogOwnerInfoNull);
    // });

    // it(`Creating user`, async () => {
    //   const result = await creatingUser(httpServer, createUserDto);
    //   expect(result.status).toBe(201);
    //   user = result.body;
    // });
    //
    // it(`Should bind blog with user`, async () => {
    //   const result = await request(app.getHttpServer())
    //     .put(`/sa/blogs/${blog.id}/bind-with-user/${user.id}`)
    //     .auth('admin', 'qwerty');
    //   expect(result.status).toBe(204);
    // });
    //
    // it(`BlogOwnerInfo.login should be leonid`, async () => {
    //   const result = await request(app.getHttpServer())
    //     .get('/sa/blogs')
    //     .auth('admin', 'qwerty');
    //   expect(result.status).toBe(200);
    //   expect(result.body).toEqual({
    //     ...blogWithBlogOwnerInfoNull,
    //     items: [
    //       {
    //         ...blogWithBlogOwnerInfoNull.items[0],
    //         blogOwnerInfo: {
    //           ...blogWithBlogOwnerInfoNull.items[0].blogOwnerInfo,
    //           userLogin: 'leonid',
    //           userId: expect.any(String),
    //         },
    //       },
    //     ],
    //   });
    // });
  });
});
