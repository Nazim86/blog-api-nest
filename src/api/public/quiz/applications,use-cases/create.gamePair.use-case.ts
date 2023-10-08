import { CommandHandler } from '@nestjs/cqrs';
import { GamePairEntity } from '../../../entities/quiz/gamePair.entity';
import { GameStatusEnum } from '../../../../enums/game-status-enum';
import { BaseTransaction } from '../../../../common/baseTransaction';
import { DataSource, EntityManager } from 'typeorm';
import { TransactionRepository } from '../../../infrastructure/common/transaction.repository';
import { PlayersEntity } from '../../../entities/quiz/players.entity';

export class CreateGamePairCommand {
  constructor(public player: PlayersEntity) {}
}

@CommandHandler(CreateGamePairCommand)
export class CreateGamePairUseCase extends BaseTransaction<
  CreateGamePairCommand,
  string
> {
  constructor(
    dataSource: DataSource,
    private readonly transactionRepository: TransactionRepository, //private readonly usersRepository: UsersRepository,
  ) {
    super(dataSource);
  }

  async doLogic(command: CreateGamePairCommand, manager: EntityManager) {
    //const player = await this.usersRepository.findUserById(command.userId);
    //const player = await this.quizRepository.getPlayerByUserId(command.userId);

    const gamePair = new GamePairEntity();
    gamePair.player1 = command.player;
    gamePair.pairCreatedDate = new Date().toISOString();
    gamePair.status = GameStatusEnum.PendingSecondPlayer;
    // gamePair.answers = [];

    const game = await this.transactionRepository.save(gamePair, manager); //await this.quizRepository.saveGamePair(gamePair);

    //console.log(result);
    return game.id;
  }

  async execute(command: CreateGamePairCommand) {
    //return this.createGameTransaction.run(command.userId);

    return super.run(command);
  }
}
