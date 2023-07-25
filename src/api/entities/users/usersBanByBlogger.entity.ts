import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Users } from './user.entity';
import { Blogs } from '../blogs/blogs.entity';

@Entity({ name: 'users_ban_by_blogger' })
@Unique(['blog', 'user'])
export class UsersBanByBloggerEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'boolean' })
  isBanned: boolean;

  @Column({ type: 'varchar' })
  banDate: string;

  @Column({ type: 'varchar' })
  banReason: string;

  @ManyToOne(() => Blogs, (b) => b.usersBanByBlogger, { onDelete: 'CASCADE' })
  @JoinColumn()
  blog: Blogs;

  @OneToOne(() => Users, (u) => u.usersBanByBlogger, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: Users;
}
