import { Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { UserId } from '../../../decorators/UserId';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { CreateConnectionService } from './applications,use-cases/create-connection.service';
import { QuizQueryRepository } from '../../infrastructure/quiz/quiz.query.repository';
import { QuizRepository } from '../../infrastructure/quiz/quiz.repository';
import { ResultCode } from '../../../exception-handler/result-code-enum';
import { exceptionHandler } from '../../../exception-handler/exception-handler';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { CommandBus } from '@nestjs/cqrs';
import { CreateAnswerCommand } from './applications,use-cases/create.answer.use-case';

@UseGuards(AccessTokenGuard)
@Controller('pair-game-quiz/pairs')
export class PublicQuizController {
  constructor(
    private readonly createConnectionService: CreateConnectionService,
    private readonly quizQueryRepository: QuizQueryRepository,
    private readonly quizRepository: QuizRepository,
    private commandBus: CommandBus,
  ) {}
  @Post('connection')
  @HttpCode(200)
  async createConnection(@UserId() userId) {
    const gamePairId = await this.createConnectionService.createConnection(
      userId,
    );

    if (gamePairId.code != ResultCode.Success) {
      return exceptionHandler(gamePairId.code);
    }

    const result = await this.quizQueryRepository.getGamePairById(
      gamePairId.data,
    );
    //console.log(result);
    return result;
  }

  @Post('my-current/answers')
  @HttpCode(200)
  async createAnswers(@UserId() userId, createAnswerDto: CreateAnswerDto) {
    const answer = await this.commandBus.execute(
      new CreateAnswerCommand(userId, createAnswerDto),
    );

    if (answer.code !== ResultCode.Success) {
      return exceptionHandler(answer.code);
    }
    return answer.data;
  }
}
