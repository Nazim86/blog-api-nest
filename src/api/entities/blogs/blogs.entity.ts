import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PostInfo } from '../comments/postInfo.entity';
import { BlogBanInfo } from './blogBanInfo.entity';

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

  @OneToMany(() => PostInfo, (pi) => pi.blog)
  postInfo: PostInfo;

  @OneToOne(() => BlogBanInfo, (bbi) => bbi.blog)
  blogBanInfo: BlogBanInfo;
}
