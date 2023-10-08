import { CommandHandler } from '@nestjs/cqrs';
import { AnswersEntity } from '../../../entities/quiz/answers.entity';
import { QuizRepository } from '../../../infrastructure/quiz/quiz.repository';
import { CreateAnswerDto } from '../dto/create-answer.dto';
import { GameStatusEnum } from '../../../../enums/game-status-enum';
import { ResultCode } from '../../../../exception-handler/result-code-enum';
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
    //private readonly usersRepository: UsersRepository,
    private transactionRepository: TransactionRepository,
  ) {
    super(dataSource);
  }

  async doLogic(command: CreateAnswerCommand, manager: EntityManager) {
    //const player = await this.usersRepository.findUserById(command.userId);

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

    let player = gamePair.player1;

    if (player.user.id !== command.userId) {
      player = gamePair.player2;
    }

    let answerStatus;

    if (
      gamePair.questions[answers.length].correctAnswers.includes(
        command.createAnswerDto.answer,
      )
    ) {
      //console.log(player);
      answerStatus = AnswersEnum.Correct;
      player.score += 1;
      console.log('player', player);
      await this.transactionRepository.save(player, manager);
    } else {
      answerStatus = AnswersEnum.Incorrect;
    }

    const answer: AnswersEntity = new AnswersEntity();
    answer.player = player;
    answer.question = gamePair.questions[answers.length];
    answer.addedAt = new Date();
    answer.answerStatus = answerStatus;
    answer.gamePairs = gamePair;

    console.log('answer', answer);
    const newAnswer = await this.transactionRepository.save(answer, manager);

    //console.log(newAnswer);

    if (answers.length === 4 && gamePair.answers.length === 9) {
      //console.log(gamePair.player1, gamePair.player2);
      let bonusPlayer;
      if (
        gamePair.player1.score > 0 &&
        gamePair.player1.user.id === command.userId
      ) {
        bonusPlayer = gamePair.player2;
        bonusPlayer.score += 1;
      }

      if (
        gamePair.player2.score > 0 &&
        gamePair.player2.user.id === command.userId
      ) {
        bonusPlayer = gamePair.player1;
        bonusPlayer.score += 1;
      }

      // if (
      //   gamePair.player1.playerStatistics.score ===
      //   gamePair.player2.playerStatistics.score
      // ) {
      //   gamePair.player1.playerStatistics.winningStatus =
      //     WinningStatusEnum.Draw;
      //   gamePair.player2.playerStatistics.winningStatus =
      //     WinningStatusEnum.Draw;
      // }
      //
      // if (
      //   gamePair.player1.playerStatistics.score >
      //   gamePair.player2.playerStatistics.score
      // ) {
      //   gamePair.player1.playerStatistics.winningStatus =
      //     WinningStatusEnum.Winner;
      //   gamePair.player2.playerStatistics.winningStatus =
      //     WinningStatusEnum.Loser;
      // } else {
      //   gamePair.player1.playerStatistics.winningStatus =
      //     WinningStatusEnum.Loser;
      //   gamePair.player2.playerStatistics.winningStatus =
      //     WinningStatusEnum.Winner;
      // }

      gamePair.status = GameStatusEnum.Finished;
      gamePair.finishGameDate = new Date().toISOString();

      console.log('bonusPlayer', bonusPlayer);
      await this.transactionRepository.save(bonusPlayer, manager);
    }

    gamePair.answers.push(newAnswer);

    console.log('gamePair', gamePair);
    await this.transactionRepository.save(gamePair, manager);

    return {
      code: ResultCode.Success,
      data: newAnswer.id,
    };
  }
  async execute(command: CreateAnswerCommand) {
    return super.run(command);
  }
}
