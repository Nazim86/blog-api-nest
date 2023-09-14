import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../../src/app.module';

import { rootMongooseTestModule } from '../../mongoose-test-module';

import { appSettings } from '../../../src/app.settings';
import {
  connectUserToGame,
  createQuestion,
  publishQuestion,
} from '../../functions/quiz_functions';
import { createQuestionDTO, publishQuestionDTO } from '../../data/quiz-data';
import { CommandBus } from '@nestjs/cqrs';
import { QuestionsQueryRepository } from '../../../src/api/infrastructure/quiz/questions.query.repository';

import { creatingUser, loginUser } from '../../functions/user_functions';
import { createUserDto, loginDto } from '../../data/user-data';
import { GameStatusEnum } from '../../../src/enums/game-status-enum';

describe('Super Admin quiz testing', () => {
  let app: INestApplication;
  let httpServer;
  let commandBus: CommandBus;
  let quizQueryRepository: QuestionsQueryRepository;

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
    quizQueryRepository = app.get(QuestionsQueryRepository);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Game connection, answers, return unfinished tests,getting game by id ', () => {
    //let user;
    let questionId;
    const users = [];
    const accessTokens = [];

    it('should wipe all data in db', async () => {
      const response = await request(httpServer).delete('/testing/all-data');
      expect(response.status).toBe(204);
    });

    it('creating 4 users and login all of them  ', async () => {
      for (let i = 0; i <= 3; i++) {
        const user = await creatingUser(httpServer, {
          ...createUserDto,
          email: `nazim86mammadov${i}@yandex.ru`,
          login: `leo${i}`,
        });
        users.push(user.body);

        const accessToken = await loginUser(httpServer, {
          ...loginDto,
          loginOrEmail: `leo${i}`,
        });
        accessTokens.push(accessToken.body.accessToken);
      }
    });

    it(`Connect current user to existing random pending pair or create new pair which will be waiting
     for second player`, async () => {
      const gamePairWithPlayer1 = await connectUserToGame(
        httpServer,
        accessTokens[0],
      );

      console.log(gamePairWithPlayer1.body);

      expect(gamePairWithPlayer1.status).toBe(200);
      //expect(gamePairWithPlayer1.body).toEqual(gamePairViewModelWithPlayer1);
      expect(gamePairWithPlayer1.body.firstPlayerProgress.player.login).toEqual(
        'leo0',
      );
      expect(gamePairWithPlayer1.body.status).toEqual(
        GameStatusEnum.PendingSecondPlayer,
      );

      // const player = await getGamePairByUserId(user.body.id);
    });

    it(`Creating 10 questions and publishing 5 of them `, async () => {
      for (let i = 0; i <= 9; i++) {
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
    });

    it(`Connecting second player`, async () => {
      const gamePairWithPlayer2 = await connectUserToGame(
        httpServer,
        accessTokens[1],
      );
      console.log(gamePairWithPlayer2.body);
      expect(gamePairWithPlayer2.status).toBe(200);
      //expect(gamePairWithPlayer2.body).toEqual(gamePairViewModelWithPlayer2);
      expect(gamePairWithPlayer2.body.firstPlayerProgress.player.login).toEqual(
        'leo0',
      );
      expect(
        gamePairWithPlayer2.body.secondPlayerProgress.player.login,
      ).toEqual('leo1');
      expect(gamePairWithPlayer2.body.status).toEqual(GameStatusEnum.Active);
    });
  });
});
