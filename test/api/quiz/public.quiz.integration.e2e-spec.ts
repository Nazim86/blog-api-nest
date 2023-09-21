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
import { QuestionsRepository } from '../../../src/api/infrastructure/quiz/questions.repository';

import { UsersRepository } from '../../../src/api/infrastructure/users/users.repository';
import { GamePairEntity } from '../../../src/api/entities/quiz/gamePair.entity';
import { QuizRepository } from '../../../src/api/infrastructure/quiz/quiz.repository';
import { DataSource } from 'typeorm';
import { QuestionsEntity } from '../../../src/api/entities/quiz/questionsEntity';
import { CreateAnswerCommand } from '../../../src/api/public/quiz/applications,use-cases/create.answer.use-case';
import { AnswersEnum } from '../../../src/enums/answers-enum';

describe('Super Admin quiz testing', () => {
  let app: INestApplication;
  //let createAnswerUseCase: CreateAnswerUseCase;
  let httpServer;
  let commandBus: CommandBus;
  let questionRepository: QuestionsRepository;
  let usersRepository;
  let quizRepository;
  let dataSource;

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
    questionsQueryRepository = app.get(QuestionsQueryRepository);
    questionRepository = app.get(QuestionsRepository);
    usersRepository = app.get(UsersRepository);
    quizRepository = app.get(QuizRepository);
    dataSource = app.get(DataSource);
    //createAnswerUseCase = app.get(CreateAnswerUseCase);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Game connection, answers, return unfinished tests,getting game by id ', () => {
    //let user;

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

      expect(gamePairWithPlayer1.status).toBe(200);
      //expect(gamePairWithPlayer1.body).toEqual(gamePairViewModelWithPlayer1);
      expect(gamePairWithPlayer1.body.firstPlayerProgress.player.login).toEqual(
        'leo0',
      );
      expect(gamePairWithPlayer1.body.status).toEqual(
        GameStatusEnum.PendingSecondPlayer,
      );
      expect(gamePairWithPlayer1.body.questions).toBe(null);

      // const player = await getGamePairByUserId(user.body.id);
    });

    it(`Creating 10 questions and publishing 5 of them `, async () => {
      for (let i = 0; i <= 9; i++) {
        createQuestionDTO.correctAnswers.pop();
        createQuestionDTO.correctAnswers.push(i.toString());
        const question = await createQuestion(httpServer, {
          ...createQuestionDTO,
          body: `How old are you?${i}`,
        });

        //console.log(question.body);

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

    it(`Connecting second player and checking questions attached`, async () => {
      const player2 = await usersRepository.findUserById(users[1].id);

      const gamePairByStatus: GamePairEntity =
        await quizRepository.getGamePairByStatus(
          GameStatusEnum.PendingSecondPlayer,
        );

      const fiveQuestions = await dataSource
        .getRepository(QuestionsEntity)
        .createQueryBuilder('q')
        .where('q.published = true')
        .orderBy('q.createdAt', 'ASC')
        .limit(5)
        .getMany();

      const gamePair = gamePairByStatus;
      gamePair.player2 = player2;
      gamePair.startGameDate = new Date().toISOString();
      gamePair.questions = fiveQuestions;
      gamePair.status = GameStatusEnum.Active;

      const updatedGamePair = await quizRepository.saveGamePair(gamePair);

      console.log(updatedGamePair.questions);

      expect(updatedGamePair.player1.login).toEqual('leo0');
      expect(updatedGamePair.player2.login).toEqual('leo1');
      expect(updatedGamePair.status).toEqual(GameStatusEnum.Active);
      expect(updatedGamePair.questions.length).toBe(5);

      // checking question published for first question
      let question = await questionRepository.getQuestionById(
        updatedGamePair.questions[0].id,
      );
      expect(question.published).toBe(true);

      //checking question published for last question
      question = await questionRepository.getQuestionById(
        updatedGamePair.questions[4].id,
      );
      expect(question.published).toBe(true);
    });

    it(`Current user is already participating in active pair and status 403`, async () => {
      const gamePairWithPlayer1 = await connectUserToGame(
        httpServer,
        accessTokens[0],
      );
      const gamePairWithPlayer2 = await connectUserToGame(
        httpServer,
        accessTokens[1],
      );

      expect(gamePairWithPlayer2.status).toBe(403);
      expect(gamePairWithPlayer1.status).toBe(403);
    });

    it(`Answering questions and status 200`, async () => {
      for (let i = 0; i < 5; i++) {
        // console.log(`${i + 5}`, typeof `${i + 5}`);
        const answerDto = {
          answer: `${9 - i}`,
        };

        const answerPl1 = await commandBus.execute(
          new CreateAnswerCommand(users[0].id, answerDto),
        );
        const answerPl2 = await commandBus.execute(
          new CreateAnswerCommand(users[1].id, answerDto),
        );

        expect(answerPl1.player.login).toEqual('leo0');
        expect(answerPl1.gamePairs.status).toEqual(GameStatusEnum.Active);
        expect(answerPl1.answerStatus).toEqual(AnswersEnum.Correct);

        if (i === 4) {
          expect(answerPl2.gamePairs.status).toEqual(GameStatusEnum.Finished);
        } else {
          expect(answerPl2.gamePairs.status).toEqual(GameStatusEnum.Active);
        }

        expect(answerPl2.player.login).toEqual('leo1');

        expect(answerPl2.answerStatus).toEqual(AnswersEnum.Correct);
      }
    });
  });
});
