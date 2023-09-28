import { CommandHandler } from '@nestjs/cqrs';
import { QuestionsEntity } from '../../../entities/quiz/questions.entity';
import { QuestionsRepository } from '../../../infrastructure/quiz/questions.repository';
import { PublishQuestionDto } from '../dto/publishQuestionDto';
import { ResultCode } from '../../../../exception-handler/result-code-enum';

export class PublishQuestionCommand {
  constructor(
    public questionId: string,
    public publishQuestionDto: PublishQuestionDto,
  ) {}
}

@CommandHandler(PublishQuestionCommand)
export class PublishQuestionUseCase {
  constructor(private readonly quizRepository: QuestionsRepository) {}

  async execute(command: PublishQuestionCommand) {
    const question: QuestionsEntity = await this.quizRepository.getQuestionById(
      command.questionId,
    );

    if (!question) return { code: ResultCode.NotFound };

    question.published = command.publishQuestionDto.published;
    question.updatedAt = new Date().toISOString();

    await this.quizRepository.saveQuestion(question);

    return { code: ResultCode.Success };
  }
}
