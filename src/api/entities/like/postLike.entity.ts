import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Users } from '../users/user.entity';
import { Posts } from '../posts/posts.entity';

@Entity({ name: 'post_like' })
@Unique(['post', 'user'])
export class PostLike {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp without time zone' })
  addedAt: Date;

  @Column({ type: 'varchar' })
  status: string;

  @ManyToOne(() => Posts, (p) => p.postLike, { onDelete: 'CASCADE' })
  @JoinColumn()
  post: Posts;

  @ManyToOne(() => Users, (u) => u.postLike, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: Users;
}
