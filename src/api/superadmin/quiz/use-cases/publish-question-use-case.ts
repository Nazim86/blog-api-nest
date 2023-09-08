import { CommandHandler } from '@nestjs/cqrs';
import { QuestionsEntity } from '../../../entities/quiz/questionsEntity';
import { QuizRepository } from '../../../infrastructure/quiz/quiz.repository';
import { PublishQuestionDto } from '../dto/publishQuestionDto';

export class PublishQuestionCommand {
  constructor(
    public questionId: string,
    public publishQuestionDto: PublishQuestionDto,
  ) {}
}

@CommandHandler(PublishQuestionCommand)
export class PublishQuestionUseCase {
  constructor(private readonly quizRepository: QuizRepository) {}

  async execute(command: PublishQuestionCommand) {
    const question: QuestionsEntity = await this.quizRepository.getQuestionById(
      command.questionId,
    );

    question.published = command.publishQuestionDto.published;

    const savedQuestion = await this.quizRepository.saveQuestion(question);

    return !!savedQuestion;
  }
}
