import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Blogs } from './blogs.entity';

@Entity({ name: 'blogMainImage' })
export class BlogMainImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  url: string;

  @Column({ type: 'varchar' })
  width: number;

  @Column({ type: 'varchar' })
  height: number;

  @Column({ type: 'varchar' })
  fileSize: number;

  @ManyToOne(() => Blogs, (b) => b.mainImage, { onDelete: 'CASCADE' })
  @JoinColumn()
  blogs: Blogs;
}
