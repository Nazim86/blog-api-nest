import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { BasicAuthGuard } from '../../../public/auth/guards/basic-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { CreateQuestionDto } from '../dto/createQuestionDto';
import { CreateQuestionCommand } from '../use-cases/create-question-use-case';

@UseGuards(BasicAuthGuard)
@Controller('sa/quiz/questions')
export class SAQuizQuestionsController {
  constructor(private commandBus: CommandBus) {}

  @Post()
  async createQuestions(@Body() createQuestionDto: CreateQuestionDto) {
    await this.commandBus.execute(new CreateQuestionCommand(createQuestionDto));
  }
}
