import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Posts } from './posts.entity';

@Entity({ name: 'blogMainImage' })
export class PostMainImage {
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

  @ManyToOne(() => Posts, (p) => p.mainImage, { onDelete: 'CASCADE' })
  @JoinColumn()
  post: Posts;
}
