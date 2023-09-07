import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PlayersEntity } from './players.entity';
import { GameStatusEnum } from '../../../enums/game-status-enum';

@Entity({ name: 'game_pair' })
export class GamePairEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  pairCreatedDate: string;

  @Column({ type: 'varchar' })
  startGameDate: string;

  @Column({ type: 'varchar' })
  finishGameDate: string;

  @Column({ type: 'enum', enum: GameStatusEnum })
  status: GameStatusEnum;

  @OneToMany(() => PlayersEntity, (p) => p.gamePair)
  player: PlayersEntity;
}
