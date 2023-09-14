import { AnswersEnum } from '../../../../enums/answers-enum';

export type GamePairViewModel = {
  id: string;
  firstPlayerProgress: {
    answers:
      | [
          {
            questionId: string;
            answerStatus: AnswersEnum;
            addedAt: string;
          },
        ]
      | [];
    player: {
      id: string;
      login: string;
    };
    score: number;
  };
  secondPlayerProgress: null | {
    answers:
      | [
          {
            questionId: string;
            answerStatus: AnswersEnum;
            addedAt: string;
          },
        ]
      | [];
    player: {
      id: 'string';
      login: 'string';
    };
    score: 0;
  };
  questions:
    | null
    | [
        {
          id: 'string';
          body: 'string';
        },
      ];
  status: string;
  pairCreatedDate: string;
  startGameDate: string | null;
  finishGameDate: string | null;
};
