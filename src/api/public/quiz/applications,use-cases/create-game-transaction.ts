// import extend = Handlebars.Utils.extend;
// import { BaseTransaction } from '../../../../common/baseTransaction';
// import { Injectable } from '@nestjs/common';
// import { DataSource, EntityManager } from 'typeorm';
// import { GamePairEntity } from '../../../entities/quiz/gamePair.entity';
// import { GameStatusEnum } from '../../../../enums/game-status-enum';
// import { UsersRepository } from '../../../infrastructure/users/users.repository';
//
// @Injectable()
// export class CreateGameTransaction extends BaseTransaction<string, string> {
//   constructor(
//     dataSource: DataSource,
//     private readonly usersRepository: UsersRepository,
//   ) {
//     super(dataSource);
//   }
//
//   protected async execute(userId: string, manager: EntityManager) {
//     const player = await this.usersRepository.findUserById(userId);
//     //const player = await this.quizRepository.getPlayerByUserId(command.userId);
//
//     const gamePair = new GamePairEntity();
//     gamePair.player1 = player;
//     gamePair.pairCreatedDate = new Date().toISOString();
//     gamePair.status = GameStatusEnum.PendingSecondPlayer;
//     // gamePair.answers = [];
//
//     const game = await manager.save(gamePair);
//
//     //console.log(result);
//     return game.id;
//   }
// }
