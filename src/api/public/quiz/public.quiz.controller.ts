import {
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
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
import { CustomParseUUIDPipe } from '../../../exception-handler/custom-parse-uuid-pipe';

@UseGuards(AccessTokenGuard)
@Controller('pair-game-quiz/pairs')
export class PublicQuizController {
  constructor(
    private readonly createConnectionService: CreateConnectionService,
    private readonly quizQueryRepository: QuizQueryRepository,
    private readonly quizRepository: QuizRepository,
    private commandBus: CommandBus, //private readonly usersRepository: UsersRepository,
  ) {}

  @Get('my-current')
  async getMyCurrentGame(@UserId() userId: string) {
    const gameByUserId = await this.quizRepository.getGamePairByUserId(userId); // is this anti pattern to call from repository directly

    if (!gameByUserId) return exceptionHandler(ResultCode.NotFound);

    const game = await this.quizQueryRepository.getGamePairById(
      gameByUserId.id,
      userId,
    );

    if (game.code !== ResultCode.Success) return exceptionHandler(game.code);

    return game.data;
  }
  @Get(':id')
  async getGameById(
    @Param('id', new CustomParseUUIDPipe()) gamePairId: string,
    @UserId() userId: string,
  ) {
    const game = await this.quizQueryRepository.getGamePairById(
      gamePairId,
      userId,
    );

    if (game.code !== ResultCode.Success) return exceptionHandler(game.code);

    return game.data;
  }
  @Post('connection')
  @HttpCode(200)
  async createConnection(@UserId() userId: string) {
    const gamePairId = await this.createConnectionService.createConnection(
      userId,
    );

    if (gamePairId.code != ResultCode.Success) {
      return exceptionHandler(gamePairId.code);
    }

    const game = await this.quizQueryRepository.getGamePairById(
      gamePairId.data,
      userId,
    );

    if (game.code !== ResultCode.Success) return exceptionHandler(game.code);

    //console.log(result);
    return game.data;
  }

  @Post('my-current/answers')
  @HttpCode(200)
  async createAnswers(
    @UserId() userId: string,
    createAnswerDto: CreateAnswerDto,
  ) {
    const answerId = await this.commandBus.execute(
      new CreateAnswerCommand(userId, createAnswerDto),
    );

    if (answerId.code !== ResultCode.Success) {
      return exceptionHandler(answerId.code);
    }
    return this.quizQueryRepository.getAnswerById(answerId);
  }
}
