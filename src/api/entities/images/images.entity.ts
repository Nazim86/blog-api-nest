import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Blogs } from '../blogs/blogs.entity';

@Entity({ name: 'images' })
export class Images {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  url: string;

  @Column({ type: 'varchar' })
  width: string;

  @Column({ type: 'varchar' })
  height: string;

  @Column({ type: 'varchar' })
  fileSize: string;

  @Column({ type: 'varchar' })
  imageType: string;

  @Column({ type: 'varchar' })
  test: string;

  @ManyToOne(() => Blogs, (b) => b.images, { onDelete: 'CASCADE' })
  @JoinColumn()
  blogs: Blogs;
}
