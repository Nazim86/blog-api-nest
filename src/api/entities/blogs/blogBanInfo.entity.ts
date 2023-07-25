import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Blogs } from './blogs.entity';

@Entity({ name: 'blog_ban_info' })
export class BlogBanInfo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'boolean' })
  isBanned: boolean;

  @Column({ type: 'timestamp without time zone', nullable: true })
  banDate: Date;

  @OneToOne(() => Blogs, (b) => b.blogBanInfo, { onDelete: 'CASCADE' })
  @JoinColumn()
  blog: Blogs;
}
