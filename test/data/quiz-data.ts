import { CreateQuestionDto } from '../../src/api/superadmin/quiz/dto/createQuestionDto';
import { PublishQuestionDto } from '../../src/api/superadmin/quiz/dto/publishQuestionDto';

export const createQuestionDTO: CreateQuestionDto = {
  body: 'How old are you?',
  correctAnswers: ['36', 'thirty-six', 'thirty six'],
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
  correctAnswers: expect.any(String),
  published: expect.any(Boolean),
  createdAt: expect.any(String),
  updatedAt: null, // could not make expecting null or string therefore made two Models one for create one for update
};

export const updatedQuestionViewModel = {
  id: expect.any(String),
  body: expect.any(String),
  correctAnswers: expect.any(String),
  published: expect.any(Boolean),
  createdAt: expect.any(String),
  updatedAt: expect.any(String),
};
