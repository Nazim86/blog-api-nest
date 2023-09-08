import {
  Body,
  Controller,
  HttpCode,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { BasicAuthGuard } from '../../../public/auth/guards/basic-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { CreateQuestionDto } from '../dto/createQuestionDto';
import { CreateQuestionCommand } from '../use-cases/create-question-use-case';
import { QuizQueryRepository } from '../../../infrastructure/quiz/quiz.query.repository';
import { exceptionHandler } from '../../../../exception-handler/exception-handler';
import { ResultCode } from '../../../../exception-handler/result-code-enum';
import { UpdateQuestionCommand } from '../use-cases/update-question-use-case';

@UseGuards(BasicAuthGuard)
@Controller('sa/quiz/questions')
export class SAQuizQuestionsController {
  constructor(
    private commandBus: CommandBus,
    private readonly quizQueryRepository: QuizQueryRepository,
  ) {}

  @Post()
  async createQuestions(@Body() createQuestionDto: CreateQuestionDto) {
    const questionId = await this.commandBus.execute(
      new CreateQuestionCommand(createQuestionDto),
    );

    return await this.quizQueryRepository.getQuestionById(questionId);
  }

  @Put(':id')
  @HttpCode(204)
  async Questions(
    @Param('id') id,
    @Body() updateQuestionDto: CreateQuestionDto,
  ) {
    const isUpdated = await this.commandBus.execute(
      new UpdateQuestionCommand(id, updateQuestionDto),
    );

    if (!isUpdated) return exceptionHandler(ResultCode.BadRequest);
    return;
  }
}
