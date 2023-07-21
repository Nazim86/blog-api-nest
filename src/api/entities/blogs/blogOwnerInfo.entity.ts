import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Users } from '../users/user.entity';
import { Blogs } from './blogs.entity';

//Todo Do I need separate blogOwnerInfo?
@Entity({ name: 'blog_owner_info' })
export class BlogOwnerInfo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, type: 'varchar' })
  userLogin: string;

  @OneToOne(() => Users, (u) => u.blogOwnerInfo)
  @JoinColumn()
  user: Users;

  @OneToOne(() => Blogs, (b) => b.blogOwnerInfo)
  @JoinColumn()
  blog: Blogs;
}
