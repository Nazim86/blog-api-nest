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
import { BlogWallpaperImage } from './blogWallpaperImage.entity';
import { BlogMainImage } from './blogMainImage.entity';
import { SubscribeBlog } from './subscribeBlog.entity';

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

  @OneToOne(() => BlogBanInfo, (bbi) => bbi.blog)
  blogBanInfo: BlogBanInfo;

  @ManyToOne(() => Users, (u) => u.blogs, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner' })
  owner: Users;

  @OneToMany(() => Posts, (p) => p.blog)
  post: Posts;

  @OneToMany(() => UsersBanByBlogger, (ubb) => ubb.blog)
  usersBanByBlogger: UsersBanByBlogger;

  @OneToOne(() => BlogWallpaperImage, (i) => i.blogs)
  wallpaperImage: BlogWallpaperImage;

  @OneToMany(() => BlogWallpaperImage, (i) => i.blogs)
  mainImage: BlogMainImage[];

  @OneToMany(() => SubscribeBlog, (sb) => sb.blog)
  subscribeBlog: SubscribeBlog[];
}
