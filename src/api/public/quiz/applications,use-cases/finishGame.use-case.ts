import { CommandHandler } from '@nestjs/cqrs';
import { QuizRepository } from '../../../infrastructure/quiz/quiz.repository';
import { Cron, CronExpression } from '@nestjs/schedule';
import { addSeconds } from 'date-fns';
import { GameStatusEnum } from '../../../../enums/game-status-enum';

export class FinishGameCommand {}

@CommandHandler(FinishGameCommand)
export class FinishGameUseCase {
  constructor(private readonly quizRepo: QuizRepository) {}

  @Cron(CronExpression.EVERY_SECOND)
  async execute() {
    const activeGames = await this.quizRepo.getActiveGames();

    activeGames.map(async (g) => {
      if (
        g.player1.answers.length === g.questions.length &&
        g.player1.answers[0].addedAt < addSeconds(new Date(), -10)
      ) {
        await this.bonusPoint(g.player1);
        await this.finishGame(g);
        return;
      }
      if (
        g.player2.answers.length === g.questions.length &&
        g.player2.answers[0].addedAt < addSeconds(new Date(), -10)
      ) {
        await this.bonusPoint(g.player2);
        await this.finishGame(g);
        return;
      }
      return;
    });
    return;
  }

  private async bonusPoint(player) {
    if (player.score > 0) {
      player.score += 1;
    }
    await this.quizRepo.savePlayer(player);
  }

  private async finishGame(game) {
    game.status = GameStatusEnum.Finished;
    game.finishGameDate = new Date();
    await this.quizRepo.saveGame(game);
  }
}
