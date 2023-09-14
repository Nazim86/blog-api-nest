import { Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { UserId } from '../../../decorators/UserId';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { CreateConnectionService } from './applications,use-cases/create-connection.service';
import { QuizQueryRepository } from '../../infrastructure/quiz/quiz.query.repository';
import { QuizRepository } from '../../infrastructure/quiz/quiz.repository';

@UseGuards(AccessTokenGuard)
@Controller('pair-game-quiz/pairs')
export class PublicQuizController {
  constructor(
    private readonly createConnectionService: CreateConnectionService,
    private readonly quizQueryRepository: QuizQueryRepository,
    private readonly quizRepository: QuizRepository,
  ) {}
  @Post('connection')
  @HttpCode(200)
  async createConnection(@UserId() userId) {
    const gamePairId = await this.createConnectionService.createConnection(
      userId,
    );
    const result = await this.quizQueryRepository.getGamePairById(gamePairId);
    console.log(result);
    return result;
  }

  @Post('connection')
  @HttpCode(200)
  async createAnswers(@UserId() userId) {}
}
