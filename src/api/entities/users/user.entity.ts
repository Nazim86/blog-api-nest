import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UsersBanBySa } from './users-ban-by-sa.entity';
import { EmailConfirmation } from './email-confirmation';
import { PasswordRecovery } from './password-recovery';
import { CommentLike } from '../like/commentLike.entity';
import { PostLike } from '../like/postLike.entity';
import { Devices } from '../devices/devices.entity';
import { Comments } from '../comments/comments.entity';
import { Blogs } from '../blogs/blogs.entity';
import { UsersBanByBlogger } from './usersBanByBlogger.entity';

@Entity({ name: 'users' })
export class Users {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, type: 'varchar' })
  login: string;

  @Column({ unique: true, type: 'varchar' })
  passwordHash: string;

  @Column({ unique: true, type: 'varchar' })
  email: string;

  @Column({ type: 'varchar' })
  createdAt: string;

  @Column({ type: 'bool' })
  isConfirmed: boolean;

  @Column({ type: 'int', default: 0 })
  score: number;

  @OneToOne(() => UsersBanBySa, (ub) => ub.user, {
    cascade: true,
    onUpdate: 'CASCADE',
  })
  banInfo: UsersBanBySa;

  @OneToOne(() => EmailConfirmation, (ec) => ec.user, {
    cascade: true,
    onUpdate: 'CASCADE',
  })
  emailConfirmation: EmailConfirmation;

  @OneToOne(() => PasswordRecovery, (pr) => pr.user, {
    cascade: true,
    onUpdate: 'CASCADE',
  })
  passwordRecovery: PasswordRecovery;

  @OneToMany(() => CommentLike, (c) => c.user)
  commentLike: CommentLike;

  @OneToMany(() => PostLike, (pl) => pl.user)
  postLike: PostLike;

  @OneToMany(() => Devices, (d) => d.user)
  device: Devices;

  @OneToMany(() => Comments, (c) => c.user)
  comment: Comments;

  @OneToMany(() => Blogs, (b) => b.owner)
  blogs: Blogs[];

  @OneToOne(() => UsersBanByBlogger, (ubb) => ubb.user, {
    cascade: true,
    onUpdate: 'CASCADE',
  })
  usersBanByBlogger: UsersBanByBlogger;

  // @OneToMany(() => GamePairEntity, (g) => g.player1)
  // games1: GamePairEntity[];
  //
  // @OneToMany(() => GamePairEntity, (g) => g.player2)
  // games2: GamePairEntity[];

  // @OneToOne(() => PlayersEntity, (p) => p.user)
  // @JoinColumn()
  // player: PlayersEntity;
}
