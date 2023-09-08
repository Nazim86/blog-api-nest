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
