import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BlogBanInfo } from './blogBanInfo.entity';
import { Users } from '../users/user.entity';
import { UsersBanByBloggerEntity } from '../users/usersBanByBlogger.entity';

@Entity({ name: 'blogs' })
export class Blogs {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  description: string;

  @Column({ type: 'varchar' })
  websiteUrl: string;

  @Column({ type: 'varchar' })
  createdAt: string;

  @Column({ type: 'boolean' })
  isMembership: boolean;

  // @OneToMany(() => PostInfo, (pi) => pi.blog)
  // postInfo: PostInfo;

  @OneToOne(() => BlogBanInfo, (bbi) => bbi.blog)
  blogBanInfo: BlogBanInfo;

  @ManyToOne(() => Users, (u) => u.blogs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ownerId' })
  ownerId: Users;

  @OneToMany(() => UsersBanByBloggerEntity, (ubb) => ubb.blog)
  usersBanByBlogger: UsersBanByBloggerEntity;
}
