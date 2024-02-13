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

  @Column({ type: 'varchar' })
  width: number;

  @Column({ type: 'varchar' })
  height: number;

  @Column({ type: 'varchar' })
  fileSize: number;

  @OneToOne(() => Blogs, (b) => b.wallpaperImage, { onDelete: 'CASCADE' })
  @JoinColumn()
  blogs: Blogs;
}
