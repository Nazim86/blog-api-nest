import { CommandHandler } from '@nestjs/cqrs';
import { QuestionsRepository } from '../../../infrastructure/quiz/questions.repository';

export class DeleteQuestionCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeleteQuestionCommand)
export class DeleteQuestionUseCase {
  constructor(private readonly quizRepository: QuestionsRepository) {}

  async execute(command: DeleteQuestionCommand) {
    return await this.quizRepository.deleteQuestionById(command.id);
  }
}
