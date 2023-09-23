import { CreateQuestionDto } from '../dto/createQuestionDto';
import { CommandHandler } from '@nestjs/cqrs';
import { QuestionsEntity } from '../../../entities/quiz/questions.entity';
import { QuestionsRepository } from '../../../infrastructure/quiz/questions.repository';

export class CreateQuestionCommand {
  constructor(public createQuestionDto: CreateQuestionDto) {}
}

@CommandHandler(CreateQuestionCommand)
export class CreateQuestionUseCase {
  constructor(private readonly quizRepository: QuestionsRepository) {}

  async execute(command: CreateQuestionCommand) {
    const question: QuestionsEntity = new QuestionsEntity();

    question.body = command.createQuestionDto.body;
    question.correctAnswers = command.createQuestionDto.correctAnswers;
    question.createdAt = new Date().toISOString();

    const savedQuestion = await this.quizRepository.saveQuestion(question);

    return savedQuestion.id;
  }
}
