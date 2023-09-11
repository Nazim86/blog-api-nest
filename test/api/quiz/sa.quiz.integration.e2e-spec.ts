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
  deleteQuestion,
  getQuestions,
  publishQuestion,
  updatedQuestion,
} from '../../functions/quiz_functions';
import {
  createQuestionDTO,
  publishQuestionDTO,
  questionViewModel,
  updatedQuestionViewModel,
  updateQuestionDTO,
} from '../../data/quiz-data';
import { CommandBus } from '@nestjs/cqrs';
import { CreateQuestionCommand } from '../../../src/api/superadmin/quiz/use-cases/create-question-use-case';
import { QuizQueryRepository } from '../../../src/api/infrastructure/quiz/quiz.query.repository';
import { UpdateQuestionCommand } from '../../../src/api/superadmin/quiz/use-cases/update-question-use-case';
import { PublishQuestionCommand } from '../../../src/api/superadmin/quiz/use-cases/publish-question-use-case';
import { PublishedStatusEnum } from '../../../src/enums/publishedStatus-enum';
import { SortDirection } from '../../../src/enums/sort-direction.enum';

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

  describe('Creating,updating, publishing, deleting,getting questions ', () => {
    //let user;
    let questionId;

    it('should wipe all data in db', async () => {
      const response = await request(httpServer).delete('/testing/all-data');
      expect(response.status).toBe(204);
    });

    it(`SA creates question, integration Create Question Use Case and e2e test`, async () => {
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

      const createQuestione2e = await createQuestion(httpServer, {
        ...createQuestionDTO,
        body: 'How old are your grandmother?',
      });
      expect(createQuestione2e.status).toBe(201);
      expect(createQuestione2e.body).toEqual(questionViewModel);
    });

    it(`SA update question, integration test Update Question Use Case and e2e`, async () => {
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
        updateQuestionDTO,
      );

      expect(updateQuestione2e.status).toBe(204);
    });

    it(`SA publish question, integration test publish Question Use Case and e2e`, async () => {
      // const createUser = await creatingUser(httpServer, createUserDto);
      // user = createUser.body;

      const isUpdated = await commandBus.execute(
        new PublishQuestionCommand(questionId, publishQuestionDTO),
      );

      expect(isUpdated).toBe(true);
      const question = await quizQueryRepository.getQuestionById(questionId);
      expect(question.published).toBe(true);

      const updateQuestione2e = await publishQuestion(
        httpServer,
        questionId,
        publishQuestionDTO,
      );

      expect(updateQuestione2e.status).toBe(204);
    });

    it('should wipe all data in db', async () => {
      const response = await request(httpServer).delete('/testing/all-data');
      expect(response.status).toBe(204);
    });

    it(`SA gets all questions with filter and pagination with e2e test `, async () => {
      // const createUser = await creatingUser(httpServer, createUserDto);
      // user = createUser.body;
      for (let i = 0; i <= 8; i++) {
        createQuestionDTO.correctAnswers.push(i.toString());
        const question = await createQuestion(httpServer, {
          ...createQuestionDTO,
          body: `How old are you?${i}`,
        });

        // making half of questions published true in order to test publishedStatus
        if (i > 4) {
          await publishQuestion(
            httpServer,
            question.body.id,
            publishQuestionDTO,
          );
        }
      }

      let questions = await getQuestions(httpServer, {
        publishedStatus: PublishedStatusEnum.published,
      });
      expect(questions.status).toBe(200);
      expect(questions.body.items[0].published).toBe(true);
      expect(questions.body.items[3].published).toBe(true);
      expect(questions.body.items.length).toBe(4);

      questions = await getQuestions(httpServer, {
        publishedStatus: PublishedStatusEnum.notPublished,
      });
      expect(questions.status).toBe(200);
      expect(questions.body.items[0].published).toBe(false);
      expect(questions.body.items[4].published).toBe(false);
      expect(questions.body.items.length).toBe(5);

      questions = await getQuestions(httpServer, {
        bodySearchTerm: '5',
      });
      expect(questions.status).toBe(200);
      expect(questions.body.items[0].body).toEqual('How old are you?5');
      expect(questions.body.items.length).toBe(1);

      questions = await getQuestions(httpServer, {
        sortBy: 'body',
      });
      expect(questions.status).toBe(200);
      expect(questions.body.items.length).toBe(9);
      expect(questions.body.items[0].body).toEqual('How old are you?8');
      expect(questions.body.items[1].body).toEqual('How old are you?7');
      expect(questions.body.items[7].body).toEqual('How old are you?1');
      expect(questions.body.items[8].body).toEqual('How old are you?0');

      questions = await getQuestions(httpServer, {
        sortBy: 'body',
        sortDirection: SortDirection.ASC,
      });
      expect(questions.status).toBe(200);
      expect(questions.body.items.length).toBe(9);
      expect(questions.body.items[0].body).toEqual('How old are you?0');
      expect(questions.body.items[1].body).toEqual('How old are you?1');
      expect(questions.body.items[7].body).toEqual('How old are you?7');
      expect(questions.body.items[8].body).toEqual('How old are you?8');

      questions = await getQuestions(httpServer, {
        pageNumber: 3,
        pageSize: 4,
      });
      questionId = questions.body.items[0].id; // I am getting this id for next test deleteQuestions
      expect(questions.status).toBe(200);
      expect(questions.body.items.length).toBe(1);
      expect(questions.body.items[0].body).toEqual('How old are you?0');
    });

    it(`SA delete question, integration test Delete Question Use Case and e2e`, async () => {
      const isUpdated = await deleteQuestion(httpServer, questionId);

      expect(isUpdated.status).toBe(204);

      const question = await quizQueryRepository.getQuestionById(questionId);

      expect(question).toBeNull();
    });
  });
});
