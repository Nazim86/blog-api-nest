import { CreateQuestionDto } from '../../src/api/superadmin/quiz/dto/createQuestionDto';
import { PublishQuestionDto } from '../../src/api/superadmin/quiz/dto/publishQuestionDto';
import { GameStatusEnum } from '../../src/enums/game-status-enum';

export const createQuestionDTO: CreateQuestionDto = {
  body: 'How old are you?',
  correctAnswers: ['thirty-six', 'thirty six'],
};
export const createQuestionDTO2: CreateQuestionDto = {
  body: 'How old are your mom?',
  correctAnswers: ['46', 'forty-six', 'forty six'],
};
export const createQuestionDTO3: CreateQuestionDto = {
  body: 'How old are your sister?',
  correctAnswers: ['30', 'thirty'],
};
export const createQuestionDTO4: CreateQuestionDto = {
  body: 'How old are your brother?',
  correctAnswers: ['20', 'twenty'],
};

export const updateQuestionDTO: CreateQuestionDto = {
  body: 'How old are your father?',
  correctAnswers: ['56', 'fifty-six', 'fifty six'],
};
export const publishQuestionDTO: PublishQuestionDto = {
  published: true,
};

export const questionViewModel = {
  id: expect.any(String),
  body: expect.any(String),
  correctAnswers: expect.arrayContaining([expect.any(String)]),
  published: expect.any(Boolean),
  createdAt: expect.any(String),
  updatedAt: null, // could not make expecting null or string therefore made two Models one for create one for update
};

export const updatedQuestionViewModel = {
  id: expect.any(String),
  body: expect.any(String),
  correctAnswers: expect.arrayContaining([expect.any(String)]),
  published: expect.any(Boolean),
  createdAt: expect.any(String),
  updatedAt: expect.any(String),
};

export const updateQuestionModel = {
  body: expect.any(String),
  correctAnswers: expect.arrayContaining([expect.any(String)]),
};

export const gamePairViewModelWithPlayer1 = {
  id: expect.any(String),
  firstPlayerProgress: {
    answers: [
      {
        questionId: expect.any(String),
        answerStatus: expect.any(String),
        addedAt: expect.any(String),
      },
    ],
    player: {
      id: expect.any(String),
      login: expect.any(String),
    },
    score: expect.any(Number),
  },
  secondPlayerProgress: null,
  questions: null,
  status: GameStatusEnum.PendingSecondPlayer,
  pairCreatedDate: expect.any(String),
  startGameDate: null,
  finishGameDate: null,
};

export const gamePairViewModelWithPlayer2 = {
  id: expect.any(String),
  firstPlayerProgress: {
    answers: [
      {
        questionId: expect.any(String),
        answerStatus: expect.any(String),
        addedAt: expect.any(String),
      },
    ],
    player: {
      id: expect.any(String),
      login: expect.any(String),
    },
    score: expect.any(Number),
  },
  secondPlayerProgress: {
    answers: [
      {
        questionId: expect.any(String),
        answerStatus: expect.any(String),
        addedAt: expect.any(String),
      },
    ],
    player: {
      id: expect.any(String),
      login: expect.any(String),
    },
    score: expect.any(Number),
  },
  questions: [
    {
      id: expect.any(String),
      body: expect.any(String),
    },
    {
      id: expect.any(String),
      body: expect.any(String),
    },
    {
      id: expect.any(String),
      body: expect.any(String),
    },
    {
      id: expect.any(String),
      body: expect.any(String),
    },
    {
      id: expect.any(String),
      body: expect.any(String),
    },
  ],
  status: GameStatusEnum.Active,
  pairCreatedDate: expect.any(String),
  startGameDate: expect.any(String),
  finishGameDate: expect.any(String),
};

export const AnswerEntityModel = {
  id: expect.any(String),
  answerStatus: expect.any(String),
  addedAt: expect.any(String),
  question: expect.any(String),
  player: expect.any(String),
  score: expect.any(Number),
  gamePairs: expect.any(String),
};

export const createAnswerDto = { answer: expect.any(String) };
