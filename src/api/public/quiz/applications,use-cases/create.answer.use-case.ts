import { CommandHandler } from '@nestjs/cqrs';
import { AnswersEntity } from '../../../entities/quiz/answers.entity';
import { QuizRepository } from '../../../infrastructure/quiz/quiz.repository';
import { CreateAnswerDto } from '../dto/create-answer.dto';

export class CreateAnswerCommand {
  constructor(public userId: string, createAnswerDto: CreateAnswerDto) {}
}

@CommandHandler(CreateAnswerCommand)
export class CreateAnswerUseCase {
  constructor(private readonly quizRepository: QuizRepository) {}

  async execute(command: CreateAnswerCommand) {
    console.log(command.userId);
    const user = await this.quizRepository.getGamePairByUserId(command.userId);

    console.log(user);

    return user;

    //const answer = new AnswersEntity();
  }
}
