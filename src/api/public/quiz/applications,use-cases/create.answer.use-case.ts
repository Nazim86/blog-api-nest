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
import { log } from 'handlebars';
import { Cron, CronExpression, Timeout } from '@nestjs/schedule';

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

  // let gas = async () => {
  //   return new Promise(r=>{
  //     setTimeout(async()=>r(await getGas()),5e3);
  //   })
  // }

  running;
  async countDown(userId, manager?) {
    return new Promise((resolve) =>
      setTimeout(() => resolve(this.gameEndAfterCountDown(userId)), 4000),
    );
  }

  @Timeout(4000) // 10 seconds in milliseconds
  //@Cron('*/10 * * * * *')
  //@Cron(new Date(Date.now() + 4 * 1000))
  private async gameEndAfterCountDown(userId: string, manager?: EntityManager) {
    console.log('countdown function', userId);
    const gamePair =
      await this.quizRepository.getGamePairByUserIdAndGameStatusActive(userId);

    if (!gamePair) return;

    //console.log(gamePair);

    let bonusPlayer = gamePair.player1;
    if (gamePair.player2.score > 0 && gamePair.player1.user.id === userId) {
      bonusPlayer = gamePair.player2;
      bonusPlayer.score += 1;
    }

    if (gamePair.player1.score > 0 && gamePair.player2.user.id === userId) {
      bonusPlayer = gamePair.player1;
      bonusPlayer.score += 1;
    }

    gamePair.status = GameStatusEnum.Finished;
    gamePair.finishGameDate = new Date().toISOString();

    await this.quizRepository.savePlayer(bonusPlayer);
    const result = await this.quizRepository.saveGame(gamePair);

    // await this.transactionRepository.save(bonusPlayer, manager);
    // const result = await this.transactionRepository.save(gamePair, manager);

    return { bonusPlayer: bonusPlayer, gamePair: gamePair };
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
    let lastPlayer = gamePair.player2;

    if (player.user.id !== command.userId) {
      player = gamePair.player2;
      lastPlayer = gamePair.player1;
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

    const newAnswer = await this.transactionRepository.save(answer, manager);

    const answerLengthInGame = gamePair.answers.length;

    //console.log(newAnswer);

    //console.log(answerLengthInGame);

    if (answers.length === 4 && answerLengthInGame === 9) {
      //console.log(gamePair.player1, gamePair.player2);
      let bonusPlayer = gamePair.player1;
      if (
        gamePair.player2.score > 0 &&
        gamePair.player1.user.id === command.userId
      ) {
        bonusPlayer = gamePair.player2;
        bonusPlayer.score += 1;
      }

      if (
        gamePair.player1.score > 0 &&
        gamePair.player2.user.id === command.userId
      ) {
        bonusPlayer = gamePair.player1;
        bonusPlayer.score += 1;
      }

      gamePair.status = GameStatusEnum.Finished;
      gamePair.finishGameDate = new Date().toISOString();

      await this.transactionRepository.save(bonusPlayer, manager);
    }

    gamePair.answers.push(newAnswer);

    if (answers.length === 4 && gamePair.answers.length < 9) {
      //await this.countDown(lastPlayer.user.id);
      // setTimeout(() => {
      //   this.gameEndAfterCountDown(lastPlayer.user.id, manager);
      // }, 4000);
      const unsaved = this.gameEndAfterCountDown(lastPlayer.user.id, manager);
      // await this.quizRepository.savePlayer(unsaved.bonusPlayer);
      // const result = await this.quizRepository.saveGame(unsaved.gamePair);
      // await this.transactionRepository.save(unsaved.bonusPlayer, manager);
      // await this.transactionRepository.save(unsaved.gamePair, manager);
    }

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

// const unSavedEntities = await this.gameEndAfterCountDown(
//   lastPlayer.user.id,
//   manager,
// );
//
// console.log(unSavedEntities);
//
// await this.transactionRepository.save(
//   unSavedEntities.bonusPlayer,
//   manager,
// );
// const result = await this.transactionRepository.save(
//   unSavedEntities.gamePair,
//   manager,
// );

// const gameEndCountDown = setTimeout(() => {
//   // answerLengthInGame = 9;
//   //
//   // if (answers.length === 4 && answerLengthInGame === 9) {
//   //console.log(gamePair.player1, gamePair.player2);
//   //}
//   // for (let i = 0; i < 9 - gamePair.answers.length; i++) {
//   //   const answer: AnswersEntity = new AnswersEntity();
//   //   answer.player = lastPlayer;
//   //   answer.question =
//   //     gamePair.questions[Math.abs(9 - gamePair.answers.length - 5)];
//   //   answer.addedAt = new Date();
//   //   answer.answerStatus = answerStatus;
//   //   answer.gamePairs = gamePair;
//   //
//   //   const newAnswer = await this.transactionRepository.save(
//   //     answer,
//   //     manager,
//   //   );
//   // }
//   //
//   // answers = await this.quizRepository.getAnswerByUserIdAndGamePairId(
//   //   lastPlayer.user.id,
//   //   gamePair.id,
//   // );
//   //return;
// }, 2000);
//console.log('final in this if');
