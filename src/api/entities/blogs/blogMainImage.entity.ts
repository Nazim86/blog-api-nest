import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Blogs } from './blogs.entity';

@Entity({ name: 'blogMainImage' })
export class BlogMainImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  url: string;

  @Column({ type: 'int' })
  width: number;

  @Column({ type: 'int' })
  height: number;

  @Column({ type: 'int' })
  fileSize: number;

  @ManyToOne(() => Blogs, (b) => b.mainImage, { onDelete: 'CASCADE' })
  @JoinColumn()
  blogs: Blogs;
}
