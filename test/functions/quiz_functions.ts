import { CreateQuestionDto } from '../../src/api/superadmin/quiz/dto/createQuestionDto';
import request from 'supertest';
import { PublishQuestionDto } from '../../src/api/superadmin/quiz/dto/publishQuestionDto';

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

export const publishQuestion = async (
  httpServer,
  id: string,
  publishQuestionDTO: PublishQuestionDto,
) => {
  return request(httpServer)
    .put(`/sa/quiz/questions/${id}/publish`)
    .auth('admin', 'qwerty')
    .send(publishQuestionDTO);
};

export const getQuestions = async (httpServer, query?) => {
  return request(httpServer)
    .get(`/sa/quiz/questions`)
    .auth('admin', 'qwerty')
    .query(query)
    .send();
};

export const deleteQuestion = async (httpServer, id: string) => {
  return request(httpServer)
    .delete(`/sa/quiz/questions/${id}`)
    .auth('admin', 'qwerty')
    .send();
};

export const connectUserToGame = async (httpServer, accessToken: string) => {
  return request(httpServer)
    .post(`/pair-game-quiz/pairs/connection`)
    .auth(accessToken, { type: 'bearer' })
    .send();
};

export const getGameById = async (
  httpServer,
  accessToken: string,
  id: string,
) => {
  return request(httpServer)
    .get(`/pair-game-quiz/pairs/${id}`)
    .auth(accessToken, { type: 'bearer' })
    .send();
};