import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Users } from '../users/user.entity';
import { Posts } from '../posts/posts.entity';

@Entity({ name: 'post_like' })
export class PostLike {
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

  @ManyToOne(() => Posts, (p) => p.postLike, { onDelete: 'CASCADE' })
  @JoinColumn()
  post: Posts;

  @ManyToOne(() => Users, (u) => u.postLike, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: Users;
}
