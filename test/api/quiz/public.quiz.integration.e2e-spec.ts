import request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../../src/app.module';

import { appSettings } from '../../../src/app.settings';
import {
  connectUserToGame,
  createQuestion,
  getCurrentGame,
  getGameById,
  publishQuestion,
  sendAnswer,
} from '../../functions/quiz_functions';
import {
  createQuestionDTO,
  notStartedGamePairViewModelWithPlayer1,
  publishQuestionDTO,
} from '../../data/quiz-data';
import { CommandBus } from '@nestjs/cqrs';

import { creatingUser, loginUser } from '../../functions/user_functions';
import { createUserDto, loginDto } from '../../data/user-data';
import { GameStatusEnum } from '../../../src/enums/game-status-enum';
import { QuestionsRepository } from '../../../src/api/infrastructure/quiz/questions.repository';

import { UsersRepository } from '../../../src/api/infrastructure/users/users.repository';
import { GamePairEntity } from '../../../src/api/entities/quiz/gamePair.entity';
import { QuizRepository } from '../../../src/api/infrastructure/quiz/quiz.repository';
import { DataSource } from 'typeorm';
import { AnswersEnum } from '../../../src/enums/answers-enum';

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('Super Admin quiz testing', () => {
  let app: INestApplication;
  //let createAnswerUseCase: CreateAnswerUseCase;
  let httpServer;
  let commandBus: CommandBus;
  let questionRepository: QuestionsRepository;
  let usersRepository;
  let quizRepository;
  let dataSource;
  let gamePairId: string;

  jest.setTimeout(100 * 1000);
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();

    app = appSettings(app);

    await app.init();

    httpServer = app.getHttpServer();

    commandBus = app.get(CommandBus);
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
    let gamePairId: string;

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
        expect(user.status).toBe(201);
        users.push(user.body);

        const accessToken = await loginUser(httpServer, {
          ...loginDto,
          loginOrEmail: `leo${i}`,
        });
        expect(accessToken.status).toBe(200);
        accessTokens.push(accessToken.body.accessToken);
      }
    });

    it(`Connect current user, create new pair which will be waiting
     for second player`, async () => {
      const gamePairWithPlayer1 = await connectUserToGame(
        httpServer,
        accessTokens[0],
      );

      gamePairId = gamePairWithPlayer1.body.id;

      expect(gamePairWithPlayer1.status).toBe(200);
      //expect(gamePairWithPlayer1.body).toEqual(gamePairViewModelWithPlayer1);
      expect(gamePairWithPlayer1.body.firstPlayerProgress.player.login).toEqual(
        'leo0',
      );
      expect(gamePairWithPlayer1.body.status).toEqual(
        GameStatusEnum.PendingSecondPlayer,
      );
      expect(gamePairWithPlayer1.body.questions).toBe(null);
    });

    it(`Game created by user1, trying to get game by user2. Should return error if current
    user tries to get pair in which not participated; status 403`, async () => {
      const gamePair = await getGameById(
        httpServer,
        accessTokens[1],
        gamePairId,
      );

      expect(gamePair.status).toBe(403);
    });

    it(`should return error if id has invalid format; status 400;`, async () => {
      const gamePair = await getGameById(
        httpServer,
        accessTokens[1],
        'incorrect_id_format',
      );

      expect(gamePair.status).toBe(400);
    });

    it(`call "/pair-game-quiz/pairs/my-current" by user1.
    Should return new created active game; status 200;`, async () => {
      const game = await getCurrentGame(httpServer, accessTokens[0]);

      expect(game.status).toBe(200);
      expect(game.body).toEqual(notStartedGamePairViewModelWithPlayer1);
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
      const game = await connectUserToGame(httpServer, accessTokens[1]);
      expect(game.status).toBe(200);
      // expect(game.body)

      //checking question published for first question
      let question = await questionRepository.getQuestionById(
        game.body.questions[0].id,
      );
      expect(question.published).toBe(true);

      //checking question published for last question
      question = await questionRepository.getQuestionById(
        game.body.questions[4].id,
      );
      expect(question.published).toBe(true);

      gamePairId = game.body.id;
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

    it(`Player1 and player2 answering questions and status 200`, async () => {
      const game = await quizRepository.getGamePairByUserIdAndGameStatus(
        users[0].id,
      );

      gamePairId = game.id;

      for (let i = 0; i < 5; i++) {
        const answerPl1Id = await sendAnswer(
          httpServer,
          { answer: game.questions[i].correctAnswers[0] },
          accessTokens[0],
        );

        expect(answerPl1Id.status).toBe(200);
        expect(answerPl1Id.body.answerStatus).toBe(AnswersEnum.Correct);

        // Current user is not inside active pair or
        // user is in active pair but has already answered to all questions and status 403
        if (i === 2) {
          const result = await sendAnswer(
            httpServer,
            { answer: 'd' },
            accessTokens[2],
          );
          expect(result.status).toBe(403);
        }

        //create new game by user1, connect to game by user2, add 6 answers by user1.
        // Should return error if current user has already answered to all questions; status 403;
        if (i === 4) {
          const result = await sendAnswer(
            httpServer,
            { answer: 'd' },
            accessTokens[0],
          );
          //console.log(result.body);
          expect(result.status).toBe(403);
        }

        const answerPl2Id = await sendAnswer(
          httpServer,
          { answer: game.questions[i].correctAnswers[0] },
          accessTokens[1],
        );

        expect(answerPl2Id.status).toBe(200);
        expect(answerPl2Id.body.answerStatus).toBe(AnswersEnum.Correct);

        const gameAfterAnswers = await dataSource
          .getRepository(GamePairEntity)
          .createQueryBuilder('gp')
          .where('gp.id = :id', { id: gamePairId })
          .getOne();

        await quizRepository.getGamePairByUserIdAndGameStatus(users[0].id);

        if (i === 4) {
          expect(gameAfterAnswers.status).toEqual(GameStatusEnum.Finished);
        } else {
          expect(gameAfterAnswers.status).toEqual(GameStatusEnum.Active);
        }
      }
    });

    // it(`Get game by id and status 200`, async () => {
    //   const game = await getGameById(httpServer, accessTokens[0], gamePairId);
    //   //console.log(game.body);
    // });

    it(`Current user is not inside active pair or
        user is in active pair but has already answered to all questions and status 403`, async () => {
      const result = await sendAnswer(
        httpServer,
        { answer: 'y' },
        accessTokens[2],
      );
      expect(result.status).toBe(403);
    });

    it(`User answered to all questions and finished game trying to answer again and status 403`, async () => {
      const result = await sendAnswer(
        httpServer,
        { answer: 'y' },
        accessTokens[1],
      );
      //console.log(result.status);
      expect(result.status).toBe(403);
    });

    it(`Should return error if no active pair for current user; status 404`, async () => {
      const game = await getCurrentGame(httpServer, accessTokens[0]);
      //console.log(game.status);
      expect(game.status).toBe(404);
    });

    it(`Create game with two players add correct answer by firstPlayer;
    add incorrect answer by secondPlayer; add correct answer by secondPlayer;
    get active game and call "/pair-game-quiz/pairs/my-current by both users after each answer";
    status 200;`, async () => {
      const connectingPlayer1 = await connectUserToGame(
        httpServer,
        accessTokens[0],
      );
      //await delay(10000);

      expect(connectingPlayer1.status).toBe(200);

      const game = await connectUserToGame(httpServer, accessTokens[1]);

      expect(game.status).toBe(200);

      gamePairId = game.body.id;

      // console.log(newGame.body);
      //
      // expect(newGame.status).toBe(200);
      //
      // const player4 = await usersRepository.findUserById(users[1].id);
      //
      // const gamePairByStatus: GamePairEntity =
      //   await quizRepository.getGamePairByStatus(
      //     GameStatusEnum.PendingSecondPlayer,
      //   );
      //
      // console.log(gamePairByStatus);
      //
      // const fiveQuestions = await dataSource
      //   .getRepository(QuestionsEntity)
      //   .createQueryBuilder('q')
      //   .where('q.published = true')
      //   .orderBy('q.createdAt', 'ASC')
      //   .limit(5)
      //   .getMany();
      //
      // gamePairByStatus.player2 = player4;
      // gamePairByStatus.startGameDate = new Date().toISOString();
      // gamePairByStatus.questions = fiveQuestions;
      // gamePairByStatus.status = GameStatusEnum.Active;
      //
      // const updatedGamePair = await quizRepository.saveGamePair(
      //   gamePairByStatus,
      // );
      //
      // gamePairId = updatedGamePair.id;
      //
      let answer;
      let gameByPlayer1;
      let gameByPlayer2;

      //console.log(game.body);

      answer = await sendAnswer(
        httpServer,
        { answer: game.body.questions[0].correctAnswers[0] },
        accessTokens[0],
      );

      expect(answer.body.answerStatus).toBe(AnswersEnum.Correct);
      gameByPlayer1 = await getCurrentGame(httpServer, accessTokens[0]);
      gameByPlayer2 = await getCurrentGame(httpServer, accessTokens[1]);

      expect(gameByPlayer1.status).toBe(200);
      expect(gameByPlayer1.body.firstPlayerProgress.score).toBe(1);
      expect(gameByPlayer1.body.secondPlayerProgress.score).toBe(0);

      expect(gameByPlayer2.status).toBe(200);
      expect(gameByPlayer2.body.firstPlayerProgress.score).toBe(1);
      expect(gameByPlayer2.body.secondPlayerProgress.score).toBe(0);

      answer = await sendAnswer(httpServer, { answer: 'd' }, accessTokens[1]);

      expect(answer.body.answerStatus).toBe(AnswersEnum.Incorrect);
      gameByPlayer1 = await getCurrentGame(httpServer, accessTokens[0]);
      gameByPlayer2 = await getCurrentGame(httpServer, accessTokens[1]);

      expect(gameByPlayer1.status).toBe(200);
      expect(gameByPlayer1.body.firstPlayerProgress.score).toBe(1);
      expect(gameByPlayer1.body.secondPlayerProgress.score).toBe(0);

      expect(gameByPlayer2.status).toBe(200);
      expect(gameByPlayer2.body.firstPlayerProgress.score).toBe(1);
      expect(gameByPlayer2.body.secondPlayerProgress.score).toBe(0);

      answer = await sendAnswer(
        httpServer,
        { answer: game.body.questions[0].correctAnswers[0] },
        accessTokens[1],
      );

      expect(answer.body.answerStatus).toBe(AnswersEnum.Correct);
      gameByPlayer1 = await getCurrentGame(httpServer, accessTokens[0]);
      gameByPlayer2 = await getCurrentGame(httpServer, accessTokens[1]);

      expect(gameByPlayer1.status).toBe(200);
      expect(gameByPlayer1.body.firstPlayerProgress.score).toBe(1);
      expect(gameByPlayer1.body.secondPlayerProgress.score).toBe(1);

      expect(gameByPlayer2.status).toBe(200);
      expect(gameByPlayer2.body.firstPlayerProgress.score).toBe(1);
      expect(gameByPlayer2.body.secondPlayerProgress.score).toBe(1);

      // // eslint-disable-next-line prefer-const
      // gameByPlayer1 = await getCurrentGame(httpServer, accessTokens[0]);
      // gameByPlayer1 = await getCurrentGame(httpServer, accessTokens[0]);
      //
      // console.log(currentGame.body);
      //
      // expect(currentGame.status).toBe(200);
      // expect(currentGame.body.firstPlayerProgress.score).toBe(1);
      // expect(currentGame.body.secondPlayerProgress.score).toBe(0);
      //
      // currentGame = await getCurrentGame(httpServer, accessTokens[3]);
      //
      // expect(currentGame.status).toBe(200);
      // expect(currentGame.body.firstPlayerProgress.score).toBe(1);
      // expect(currentGame.body.secondPlayerProgress.score).toBe(0);
      //
      // await sendAnswer(httpServer, { answer: 'y' }, accessTokens[1]);
      //
      // currentGame = await getCurrentGame(httpServer, accessTokens[1]);
      //
      // expect(currentGame.status).toBe(200);
      // expect(currentGame.body.firstPlayerProgress.score).toBe(1);
      // expect(currentGame.body.secondPlayerProgress.score).toBe(0);
      //
      // currentGame = await getCurrentGame(httpServer, accessTokens[0]);
      //
      // console.log(currentGame.body);
      //
      // expect(currentGame.status).toBe(200);
      // expect(currentGame.body.firstPlayerProgress.score).toBe(1);
      // expect(currentGame.body.secondPlayerProgress.score).toBe(0);
      //
      // await sendAnswer(httpServer, { answer: '6' }, accessTokens[1]);
      //
      // currentGame = await getCurrentGame(httpServer, accessTokens[1]);
      //
      // expect(currentGame.status).toBe(200);
      // expect(currentGame.body.firstPlayerProgress.score).toBe(1);
      // expect(currentGame.body.secondPlayerProgress.score).toBe(1);
      //
      // currentGame = await getCurrentGame(httpServer, accessTokens[0]);
      //
      // console.log(currentGame.body);
      //
      // expect(currentGame.status).toBe(200);
      // expect(currentGame.body.firstPlayerProgress.score).toBe(1);
      // expect(currentGame.body.secondPlayerProgress.score).toBe(1);
    });
  });
});
