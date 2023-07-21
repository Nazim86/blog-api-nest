import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Blogs } from '../blogs/blogs.entity';

@Entity({ name: 'post_info' })
export class PostInfo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'varchar' })
  blogName: string;

  @Column({ unique: true, type: 'varchar' })
  blogOwnerId: string;

  @ManyToOne(() => Blogs, (b) => b.postInfo, { onDelete: 'CASCADE' })
  @JoinColumn()
  blog: Blogs;
}
