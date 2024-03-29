import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Blogs } from './blogs.entity';
import { Users } from '../users/user.entity';

@Entity({ name: 'subscribeBlog' })
export class SubscribeBlog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  status: string;

  @Column({ type: 'varchar', nullable: true })
  telegramId: string;

  @ManyToOne(() => Blogs, (b) => b.subscribeBlog, { onDelete: 'CASCADE' })
  @JoinColumn()
  blog: Blogs;

  @ManyToOne(() => Users, (u) => u.subscribeBlog, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: Users;
}
