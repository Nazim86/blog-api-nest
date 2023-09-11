import { CreateQuestionDto } from '../dto/createQuestionDto';
import { CommandHandler } from '@nestjs/cqrs';
import { QuestionsEntity } from '../../../entities/quiz/questionsEntity';
import { QuestionsRepository } from '../../../infrastructure/quiz/questions.repository';

export class UpdateQuestionCommand {
  constructor(
    public questionId: string,
    public updateQuestionDto: CreateQuestionDto,
  ) {}
}

@CommandHandler(UpdateQuestionCommand)
export class UpdateQuestionUseCase {
  constructor(private readonly quizRepository: QuestionsRepository) {}

  async execute(command: UpdateQuestionCommand) {
    const question: QuestionsEntity = await this.quizRepository.getQuestionById(
      command.questionId,
    );

    question.body = command.updateQuestionDto.body;
    question.correctAnswers = command.updateQuestionDto.correctAnswers;
    question.updatedAt = new Date().toISOString();

    const savedQuestion = await this.quizRepository.saveQuestion(question);

    return !!savedQuestion;
  }
}
