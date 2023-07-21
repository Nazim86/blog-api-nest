import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Comments } from '../comments/comments.entity';
import { Users } from '../users/user.entity';

@Entity({ name: 'comment_like' })
export class CommentLike {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // @Column({ unique: true, type: 'varchar' })
  // commentId: string;

  // @Column({ unique: true, type: 'varchar' })
  // userId: string;

  @Column({ type: 'timestamp without time zone' })
  addedAt: Date;

  @Column({ type: 'varchar' })
  status: string;

  @Column('boolean')
  banStatus: boolean;

  @ManyToOne(() => Comments, (c) => c.commentLike)
  @JoinColumn()
  comment: Comments;

  @ManyToOne(() => Users, (u) => u.commentLike)
  @JoinColumn()
  user: Users;
}
