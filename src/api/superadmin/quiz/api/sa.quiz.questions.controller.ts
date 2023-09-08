import { Body, Controller, Param, Post, Put, UseGuards } from '@nestjs/common';
import { BasicAuthGuard } from '../../../public/auth/guards/basic-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { CreateQuestionDto } from '../dto/createQuestionDto';
import { CreateQuestionCommand } from '../use-cases/create-question-use-case';
import { QuizQueryRepository } from '../../../infrastructure/quiz/quiz.query.repository';

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
  async Questions(
    @Param('id') id,
    @Body() createQuestionDto: CreateQuestionDto,
  ) {
    const questionId = await this.commandBus.execute(
      new CreateQuestionCommand(createQuestionDto),
    );

    return await this.quizQueryRepository.getQuestionById(questionId);
  }
}
