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
import { UsersBanByBlogger } from '../users/usersBanByBlogger.entity';
import { Posts } from '../posts/posts.entity';

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

  @OneToOne(() => BlogBanInfo, (bbi) => bbi.blog, {
    cascade: true,
    onUpdate: 'CASCADE',
  })
  blogBanInfo: BlogBanInfo;

  @ManyToOne(() => Users, (u) => u.blogs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner' })
  owner: Users;

  @OneToMany(() => Posts, (p) => p.blog)
  post: Posts;

  @OneToMany(() => UsersBanByBlogger, (ubb) => ubb.blog)
  usersBanByBlogger: UsersBanByBlogger;
}
