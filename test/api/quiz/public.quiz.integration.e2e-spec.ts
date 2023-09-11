// import request from 'supertest';
// import { Test } from '@nestjs/testing';
// import { INestApplication } from '@nestjs/common';
// import { AppModule } from '../../../src/app.module';
//
// import {
//   closeInMongodConnection,
//   rootMongooseTestModule,
// } from '../../mongoose-test-module';
//
// import { appSettings } from '../../../src/app.settings';
// import {
//   createQuestion,
//   deleteQuestion,
//   getQuestions,
//   publishQuestion,
//   updatedQuestion,
// } from '../../functions/quiz_functions';
// import {
//   createQuestionDTO,
//   publishQuestionDTO,
//   questionViewModel,
//   updatedQuestionViewModel,
//   updateQuestionDTO,
// } from '../../data/quiz-data';
// import { CommandBus } from '@nestjs/cqrs';
// import { CreateQuestionCommand } from '../../../src/api/superadmin/quiz/use-cases/create-question-use-case';
// import { QuestionsQueryRepository } from '../../../src/api/infrastructure/quiz/questions.query.repository';
// import { UpdateQuestionCommand } from '../../../src/api/superadmin/quiz/use-cases/update-question-use-case';
// import { PublishQuestionCommand } from '../../../src/api/superadmin/quiz/use-cases/publish-question-use-case';
// import { PublishedStatusEnum } from '../../../src/enums/publishedStatus-enum';
// import { SortDirection } from '../../../src/enums/sort-direction.enum';
// import { creatingUser } from '../../functions/user_functions';
// import { createUserDto } from '../../data/user-data';
//
// describe('Super Admin quiz testing', () => {
//   let app: INestApplication;
//   let httpServer;
//   let commandBus: CommandBus;
//   let quizQueryRepository: QuestionsQueryRepository;
//
//   jest.setTimeout(60 * 1000);
//   beforeAll(async () => {
//     const moduleRef = await Test.createTestingModule({
//       imports: [rootMongooseTestModule(), AppModule],
//     }).compile();
//
//     app = moduleRef.createNestApplication();
//
//     app = appSettings(app);
//
//     await app.init();
//
//     httpServer = app.getHttpServer();
//
//     commandBus = app.get(CommandBus);
//     quizQueryRepository = app.get(QuestionsQueryRepository);
//   });
//
//   afterAll(async () => {
//     await app.close();
//   });
//
//   describe('Game connection, answers, return unfinished tests,getting game by id ', () => {
//     //let user;
//     let questionId;
//
//     it('should wipe all data in db', async () => {
//       const response = await request(httpServer).delete('/testing/all-data');
//       expect(response.status).toBe(204);
//     });
//
//     it(`Connect current user to existing random pending pair or create new pair which will be waiting
//      for second player`, async () => {
//       const user = await creatingUser(httpServer, createUserDto);
//
//       const player = await getGamePairByUserId(user.body.id);
//     });
//   });
// });
