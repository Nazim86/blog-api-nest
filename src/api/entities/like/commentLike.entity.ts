import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Users } from '../users/user.entity';
import { Comments } from '../comments/comments.entity';

@Entity({ name: 'comment_like' })
@Unique(['comment', 'user'])
export class CommentLike {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp without time zone' })
  addedAt: Date;

  @Column({ type: 'varchar' })
  status: string;

  @ManyToOne(() => Comments, (c) => c.commentLike, { onDelete: 'CASCADE' })
  @JoinColumn()
  comment: Comments;

  @ManyToOne(() => Users, (u) => u.commentLike, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: Users;
}
