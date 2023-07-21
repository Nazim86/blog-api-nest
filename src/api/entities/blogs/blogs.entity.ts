import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BlogOwnerInfo } from './blogOwnerInfo.entity';
import { PostInfo } from '../comments/postInfo.entity';

@Entity({ name: 'blogs' })
export class Blogs {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  description: string;

  @Column({ type: 'varchar' })
  websiteUrl: string;

  @Column({ type: 'varchar' })
  createdAt: string;

  @Column({ type: 'boolean' })
  isMembership: boolean;

  @OneToOne(() => BlogOwnerInfo, (boi) => boi.blog)
  blogOwnerInfo: BlogOwnerInfo;

  @OneToMany(() => PostInfo, (pi) => pi.blog)
  postInfo: PostInfo;
}
