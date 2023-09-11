import { CommandHandler } from '@nestjs/cqrs';
import { QuizRepository } from '../../../infrastructure/quiz/quiz.repository';

export class DeleteQuestionCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeleteQuestionCommand)
export class DeleteQuestionUseCase {
  constructor(private readonly quizRepository: QuizRepository) {}

  async execute(command: DeleteQuestionCommand) {
    return await this.quizRepository.deleteQuestionById(command.id);
  }
}
