import { CreateQuestionDto } from '../../src/api/superadmin/quiz/dto/createQuestionDto';
import request from 'supertest';

export const createQuestion = async (
  httpServer,
  createQuestionDto: CreateQuestionDto,
) => {
  return request(httpServer)
    .post('/sa/quiz/questions')
    .auth('admin', 'qwerty')
    .send(createQuestionDto);
};

export const updatedQuestion = async (
  httpServer,
  id: string,
  updateQuestionDTO: CreateQuestionDto,
) => {
  return request(httpServer)
    .put(`/sa/quiz/questions/${id}`)
    .auth('admin', 'qwerty')
    .send(updateQuestionDTO);
};
