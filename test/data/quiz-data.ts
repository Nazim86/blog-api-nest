import { CreateQuestionDto } from '../../src/api/superadmin/quiz/dto/createQuestionDto';

export const createQuestionDTO: CreateQuestionDto = {
  body: 'How old are you?',
  correctAnswers: ['36', 'thirty-six', 'thirty six'],
};

export const questionViewModel = {
  id: expect.any(String),
  body: expect.any(String),
  correctAnswers: expect.any(String),
  published: expect.any(Boolean),
  createdAt: expect.any(String),
  updatedAt: null, //couldnt find
};
