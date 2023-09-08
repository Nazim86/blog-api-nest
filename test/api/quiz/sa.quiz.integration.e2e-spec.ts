import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../../src/app.module';

import {
  closeInMongodConnection,
  rootMongooseTestModule,
} from '../../mongoose-test-module';

import { appSettings } from '../../../src/app.settings';
import {
  createQuestion,
  updatedQuestion,
} from '../../functions/quiz_functions';
import {
  createQuestionDTO,
  questionViewModel,
  updatedQuestionViewModel,
  updateQuestionDTO,
} from '../../data/quiz-data';
import { CommandBus } from '@nestjs/cqrs';
import { CreateQuestionCommand } from '../../../src/api/superadmin/quiz/use-cases/create-question-use-case';
import { QuizQueryRepository } from '../../../src/api/infrastructure/quiz/quiz.query.repository';
import { UpdateQuestionCommand } from '../../../src/api/superadmin/quiz/use-cases/update-question-use-case';

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
    let questionId;

    it('should wipe all data in db', async () => {
      const response = await request(httpServer).delete('/testing/all-data');
      expect(response.status).toBe(204);
    });

    it(`SA creates question, testing Create Question Use Case and e2e test`, async () => {
      // const createUser = await creatingUser(httpServer, createUserDto);
      // user = createUser.body;

      questionId = await commandBus.execute(
        new CreateQuestionCommand(createQuestionDTO),
      );
      expect(questionId).toEqual(expect.any(String));

      const question = await quizQueryRepository.getQuestionById(questionId);
      expect(question.body).toEqual('How old are you?');
      expect(question.correctAnswers).toContain('36');
      expect(question).toEqual(questionViewModel);

      const createQuestione2e = await createQuestion(
        httpServer,
        createQuestionDTO,
      );
      expect(createQuestione2e.status).toBe(201);
      expect(createQuestione2e.body).toEqual(questionViewModel);
    });

    it(`SA update question, testing Update Question Use Case and e2e`, async () => {
      // const createUser = await creatingUser(httpServer, createUserDto);
      // user = createUser.body;

      const isUpdated = await commandBus.execute(
        new UpdateQuestionCommand(questionId, updateQuestionDTO),
      );

      expect(isUpdated).toBe(true);
      const question = await quizQueryRepository.getQuestionById(questionId);

      expect(question.body).toEqual('How old are your father?');
      expect(question.correctAnswers).toContain('56');
      expect(question).toEqual(updatedQuestionViewModel);

      const updateQuestione2e = await updatedQuestion(
        httpServer,
        questionId,
        createQuestionDTO,
      );

      expect(updateQuestione2e.status).toBe(204);
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
