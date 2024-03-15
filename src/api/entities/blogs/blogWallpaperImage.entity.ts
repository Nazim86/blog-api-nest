import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Blogs } from './blogs.entity';

@Entity({ name: 'blogWallpaper' })
export class BlogWallpaperImage {
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

  @OneToOne(() => Blogs, (b) => b.wallpaperImage, { onDelete: 'CASCADE' })
  @JoinColumn()
  blogs: Blogs;
}
