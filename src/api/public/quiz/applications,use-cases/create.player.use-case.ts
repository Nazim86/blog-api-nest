// import { CommandBus, CommandHandler } from '@nestjs/cqrs';
// import { QuizRepository } from '../../../infrastructure/quiz/quiz.repository';
// import { UsersRepository } from '../../../infrastructure/users/users.repository';
//
// export class CreatePlayerCommand {
//   constructor(public userId: string) {}
// }
//
// @CommandHandler(CreatePlayerCommand)
// export class CreatePlayerUseCase {
//   constructor(
//     private readonly playersRepository: QuizRepository,
//     private readonly usersRepository: UsersRepository,
//   ) {}
//
//   async execute(command: CreatePlayerCommand): Promise<PlayersEntity> {
//     const user = await this.usersRepository.findUserById(command.userId);
//
//     const player = new PlayersEntity();
//
//     player.user = user;
//     player.createdAt = new Date().toISOString();
//
//     return this.playersRepository.savePlayer(player);
//   }
// }