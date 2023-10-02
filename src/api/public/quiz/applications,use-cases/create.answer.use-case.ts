import { CommandHandler } from '@nestjs/cqrs';
import { AnswersEntity } from '../../../entities/quiz/answers.entity';
import { QuizRepository } from '../../../infrastructure/quiz/quiz.repository';
import { CreateAnswerDto } from '../dto/create-answer.dto';
import { GameStatusEnum } from '../../../../enums/game-status-enum';
import { ResultCode } from '../../../../exception-handler/result-code-enum';
import { UsersRepository } from '../../../infrastructure/users/users.repository';
import { AnswersEnum } from '../../../../enums/answers-enum';
import { BaseTransaction } from '../../../../common/baseTransaction';
import { DataSource, EntityManager } from 'typeorm';
import { TransactionRepository } from '../../../infrastructure/common/transaction.repository';

export class CreateAnswerCommand {
  constructor(public userId: string, public createAnswerDto: CreateAnswerDto) {}
}

@CommandHandler(CreateAnswerCommand)
export class CreateAnswerUseCase extends BaseTransaction<
  CreateAnswerCommand,
  any
> {
  constructor(
    dataSource: DataSource,
    private readonly quizRepository: QuizRepository,
    private readonly usersRepository: UsersRepository,
    private transactionRepository: TransactionRepository,
  ) {
    super(dataSource);
  }

  async doLogic(command: CreateAnswerCommand, manager: EntityManager) {
    const player = await this.usersRepository.findUserById(command.userId);

    //console.log(command.userId);

    const gamePair =
      await this.quizRepository.getGamePairByUserIdAndGameStatusActive(
        command.userId,
      );

    //console.log(gamePair);

    if (!gamePair) return { code: ResultCode.Forbidden };

    const answers: AnswersEntity[] =
      await this.quizRepository.getAnswerByUserIdAndGamePairId(
        command.userId,
        gamePair.id,
      );

    //console.log(answers);

    if (gamePair && answers.length === 5) return { code: ResultCode.Forbidden };

    let answerStatus;

    if (
      gamePair.questions[answers.length].correctAnswers.includes(
        command.createAnswerDto.answer,
      )
    ) {
      answerStatus = AnswersEnum.Correct;
    } else {
      answerStatus = AnswersEnum.Incorrect;
    }

    const answer: AnswersEntity = new AnswersEntity();
    answer.player = player;
    answer.question = gamePair.questions[answers.length];
    answer.addedAt = new Date();
    answer.answerStatus = answerStatus;
    answer.gamePairs = gamePair;

    const newAnswer = await this.transactionRepository.save(answer, manager);

    //console.log(newAnswer);

    if (answers.length === 4 && gamePair.answers.length === 9) {
      gamePair.status = GameStatusEnum.Finished;
      gamePair.finishGameDate = new Date().toISOString();
    }

    gamePair.answers.push(newAnswer);

    await this.transactionRepository.save(gamePair, manager);

    return {
      code: ResultCode.Success,
      data: newAnswer.id,
    };
  }
  async execute(command: CreateAnswerCommand) {
    // const player: PlayersEntity = await this.quizRepository.getPlayerByUserId(
    //   command.userId,
    // );

    // console.log(
    //   command.createAnswerDto.answer,
    //   typeof command.createAnswerDto.answer,
    // );
    return super.run(command);
  }
}
